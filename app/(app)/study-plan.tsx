/**
 * FE-S — Kế hoạch học tập (Study Plan).
 *
 * Câu hỏi duy nhất của màn hình: "Kỳ tới tôi học gì, và kế hoạch đã sẵn sàng gửi duyệt chưa?"
 * Layout: timeline dọc — mỗi kỳ là một mốc trên trục thời gian, thao tác bằng một tay.
 */

import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { ScreenHeader, goBack } from "@/components/ScreenHeader";
import { Sheet, Skeleton } from "@/components/ui";
import { useStudyPlan, useSavePlanDraft, usePublishPlan } from "@/lib/queries/planning";
import { useRecommendedCourses } from "@/lib/queries/course";
import { useMyProfile } from "@/lib/queries/profile";
import { useAuthStore } from "@/stores/auth";
import type { CoursePlan, StudyPlan } from "@/lib/api/planning";

const ORANGE = "#F36F21";
const ORANGE_DEEP = "#B5460D";

function formatDateVi(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function avgGpa(semesters: { projected_gpa: number }[]): number {
  if (semesters.length === 0) return 0;
  const sum = semesters.reduce((s, x) => s + (x.projected_gpa ?? 0), 0);
  return Math.round((sum / semesters.length) * 100) / 100;
}

export default function StudyPlanScreen() {
  const isDark = useColorScheme() === "dark";
  const userId = useAuthStore((s) => s.session?.user.id ?? null);

  const {
    data: serverPlan,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useStudyPlan();
  const { data: profile } = useMyProfile(userId);
  const { data: recommended = [] } = useRecommendedCourses();

  const saveDraft = useSavePlanDraft();
  const publish = usePublishPlan();

  // ── Local editable copy ──────────────────────────────────────────────
  const [draft, setDraft] = useState<StudyPlan | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [addTarget, setAddTarget] = useState<string | null>(null);
  const [sheetQuery, setSheetQuery] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (serverPlan && !draft) {
      // Initial hydration of the editable copy from the server plan.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDraft(serverPlan);
      // Mở 2 kỳ đầu, còn lại thu gọn để timeline gọn trên màn hình nhỏ.
      const init: Record<string, boolean> = {};
      serverPlan.semesters.forEach((s, i) => {
        init[s.semester_id] = i < 2;
      });
      setExpanded(init);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverPlan]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 2600);
    return () => clearTimeout(t);
  }, [notice]);

  const stats = useMemo(() => {
    if (!draft) return null;
    const totalCredits = draft.semesters.reduce(
      (s, sem) => s + sem.courses.reduce((a, c) => a + c.credits, 0),
      0
    );
    const totalCourses = draft.semesters.reduce((s, sem) => s + sem.courses.length, 0);
    return { totalCredits, totalCourses, avg: avgGpa(draft.semesters) };
  }, [draft]);

  const dirty = useMemo(() => {
    if (!serverPlan || !draft) return false;
    return JSON.stringify(serverPlan) !== JSON.stringify(draft);
  }, [serverPlan, draft]);

  const inPlanIds = useMemo(() => {
    const set = new Set<string>();
    draft?.semesters.forEach((sem) =>
      sem.courses.forEach((c) => set.add(c.course_id))
    );
    return set;
  }, [draft]);

  const candidates = useMemo(() => {
    const q = sheetQuery.trim().toLowerCase();
    return recommended
      .filter((c) => !inPlanIds.has(c.id))
      .filter((c) =>
        q ? c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) : true
      )
      .slice(0, 30);
  }, [recommended, inPlanIds, sheetQuery]);

  // ── Mutations ────────────────────────────────────────────────────────
  const toggle = (id: string) =>
    setExpanded((p) => ({ ...p, [id]: !(p[id] ?? false) }));

  const removeCourse = (semesterId: string, courseId: string) => {
    setDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        status: "draft",
        semesters: prev.semesters.map((sem) =>
          sem.semester_id === semesterId
            ? { ...sem, courses: sem.courses.filter((c) => c.course_id !== courseId) }
            : sem
        ),
      };
    });
  };

  const addCourse = (semesterId: string, course: { id: string; code: string; name: string; credits: number }) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const exists = prev.semesters.some((sem) =>
        sem.courses.some((c) => c.course_id === course.id)
      );
      if (exists) return prev;
      const plan: CoursePlan = {
        course_id: course.id,
        course_code: course.code,
        course_name: course.name,
        credits: course.credits,
        reason: "Sinh viên tự thêm vào kế hoạch",
      };
      return {
        ...prev,
        status: "draft",
        semesters: prev.semesters.map((sem) =>
          sem.semester_id === semesterId
            ? { ...sem, courses: [...sem.courses, plan] }
            : sem
        ),
      };
    });
    setNotice(`Đã thêm ${course.code} vào kế hoạch`);
  };

  const handleSave = () => {
    if (!draft || saveDraft.isPending) return;
    saveDraft.mutate(draft, {
      onSuccess: (data) => {
        if (data) setDraft(data);
        setNotice("Đã lưu bản nháp");
      },
      onError: () => setNotice("Lưu nháp thất bại, thử lại sau"),
    });
  };

  const handleSubmit = () => {
    if (!draft || publish.isPending) return;
    const doPublish = () => {
      // Đảm bảo bản nháp mới nhất được lưu trước khi gửi duyệt (mock vẫn giữ status).
      const payload: StudyPlan = { ...draft, status: "draft" };
      saveDraft.mutate(payload, {
        onSuccess: (saved) => {
          const planId = saved?.id ?? draft.id;
          publish.mutate(planId, {
            onSuccess: (data) => {
              if (data) setDraft({ ...data, status: "published" });
              else
                setDraft((p) => (p ? { ...p, status: "published" } : p));
              setNotice("Đã gửi kế hoạch cho cố vấn duyệt");
            },
            onError: () => setNotice("Gửi duyệt thất bại, thử lại sau"),
          });
        },
        onError: () => setNotice("Gửi duyệt thất bại, thử lại sau"),
      });
    };
    doPublish();
  };

  // ── States ───────────────────────────────────────────────────────────
  if (isLoading || !draft || !stats) {
    return (
      <SafeAreaView className="flex-1 bg-ground dark:bg-ground-dark" edges={["top"]}>
        <ScreenHeader
          title="Kế hoạch học tập"
          subtitle="Lộ trình các kỳ và môn học"
          onBack={goBack}
        />
        <PlanSkeleton />
      </SafeAreaView>
    );
  }

  if (isError || !draft) {
    return (
      <SafeAreaView className="flex-1 bg-ground dark:bg-ground-dark" edges={["top"]}>
        <ScreenHeader title="Kế hoạch học tập" subtitle="Lộ trình các kỳ và môn học" onBack={goBack} />
        <View className="flex-1 items-center justify-center px-8">
          <MaterialCommunityIcons name="cloud-off-outline" size={44} color="#CBD5E1" />
          <Text className="mt-3 text-center text-sm text-ink-muted dark:text-ink-muted-dark">
            Không tải được kế hoạch học tập. Kéo xuống để thử lại.
          </Text>
          <Pressable
            onPress={() => refetch()}
            className="mt-4 rounded-full px-6 py-3 active:opacity-80"
            style={{ backgroundColor: ORANGE }}
          >
            <Text className="text-sm font-bold text-white">Thử lại</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const isPublished = draft.status === "published";
  const advisorName = profile?.advisor?.user.full_name ?? "Cố vấn học tập";

  return (
    <SafeAreaView className="flex-1 bg-ground dark:bg-ground-dark" edges={["top"]}>
      <ScreenHeader
        title="Kế hoạch học tập"
        subtitle={`${stats.totalCourses} môn · ${stats.totalCredits} tín chỉ · Cập nhật ${formatDateVi(draft.generated_at)}`}
        onBack={goBack}
        right={
          <View
            className="rounded-full px-3 py-1.5"
            style={{ backgroundColor: isPublished ? "#DCFCE7" : "#FFF1E7" }}
          >
            <Text
              className="text-[11px] font-bold"
              style={{ color: isPublished ? "#15803D" : ORANGE_DEEP }}
            >
              {isPublished ? "Đã gửi duyệt" : dirty ? "Nháp · chưa lưu" : "Bản nháp"}
            </Text>
          </View>
        }
      />

      <View className="flex-1">
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 150 }}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={() => { refetch(); }} tintColor={ORANGE} />
          }
        >
          {/* ── Hero: toàn cảnh kế hoạch (flat orange, no gradient) ── */}
          <View className="px-5 pt-4">
            <View
              className="overflow-hidden rounded-[28px] p-5"
              style={{ backgroundColor: ORANGE }}
            >
              <View
                pointerEvents="none"
                className="absolute -right-14 -top-16 h-48 w-48 rounded-full"
                style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
              />
              <View
                pointerEvents="none"
                className="absolute -bottom-20 -left-12 h-52 w-52 rounded-full"
                style={{ backgroundColor: "rgba(0,0,0,0.08)" }}
              />
              <View className="flex-row items-center gap-2">
                <View
                  className="rounded-full px-3 py-1.5"
                  style={{ backgroundColor: "rgba(255,255,255,0.22)" }}
                >
                  <Text className="text-[11px] font-bold text-white">
                    {draft.semesters.length} kỳ học
                  </Text>
                </View>
                <View
                  className="rounded-full px-3 py-1.5"
                  style={{ backgroundColor: "rgba(255,255,255,0.22)" }}
                >
                  <Text className="text-[11px] font-bold text-white">
                    GPA dự kiến {stats.avg.toFixed(2)}
                  </Text>
                </View>
              </View>

              <View className="mt-4 flex-row items-end justify-between">
                <View>
                  <Text className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.85)" }}>
                    Tổng khối lượng
                  </Text>
                  <View className="flex-row items-baseline gap-1">
                    <Text className="text-[44px] font-bold leading-[48px] text-white tabular-nums">
                      {stats.totalCredits}
                    </Text>
                    <Text className="text-base font-medium" style={{ color: "rgba(255,255,255,0.8)" }}>
                      tín chỉ
                    </Text>
                  </View>
                </View>
                <View className="items-end pb-1">
                  <Text className="text-2xl font-bold text-white tabular-nums">
                    {stats.totalCourses}
                  </Text>
                  <Text className="text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.85)" }}>
                    môn trong lộ trình
                  </Text>
                </View>
              </View>

              <View
                className="mt-3 h-2.5 w-full overflow-hidden rounded-full"
                style={{ backgroundColor: "rgba(255,255,255,0.3)" }}
              >
                <View
                  className="h-full rounded-full bg-white"
                  style={{ width: `${Math.min(100, Math.round((stats.totalCredits / 150) * 100))}%` }}
                />
              </View>
              <Text
                className="mt-2 text-[11px] font-medium"
                style={{ color: "rgba(255,255,255,0.9)" }}
              >
                {Math.min(100, Math.round((stats.totalCredits / 150) * 100))}% chương trình SE 150 tín chỉ
                {"  ·  "}Người duyệt: {advisorName}
              </Text>
            </View>
          </View>

          {/* ── KPI strip: một card chia 3 ô bằng hairline ── */}
          <View className="px-5 pt-4">
            <View className="flex-row rounded-3xl border border-line bg-surface dark:border-line-dark dark:bg-surface-dark">
              <View className="flex-1 items-center py-4">
                <Text className="text-[11px] font-medium text-ink-muted dark:text-ink-muted-dark">
                  Số kỳ
                </Text>
                <Text className="mt-1 text-xl font-bold text-ink tabular-nums dark:text-ink-dark">
                  {draft.semesters.length}
                </Text>
              </View>
              <View className="w-px bg-line dark:bg-line-dark" />
              <View className="flex-1 items-center py-4">
                <Text className="text-[11px] font-medium text-ink-muted dark:text-ink-muted-dark">
                  Tín chỉ TB/kỳ
                </Text>
                <Text className="mt-1 text-xl font-bold text-ink tabular-nums dark:text-ink-dark">
                  {draft.semesters.length
                    ? Math.round(stats.totalCredits / draft.semesters.length)
                    : 0}
                </Text>
              </View>
              <View className="w-px bg-line dark:bg-line-dark" />
              <View className="flex-1 items-center py-4">
                <Text className="text-[11px] font-medium text-ink-muted dark:text-ink-muted-dark">
                  Trạng thái
                </Text>
                <View className="mt-1.5 flex-row items-center gap-1.5">
                  <View
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: isPublished ? "#16A34A" : ORANGE }}
                  />
                  <Text className="text-[13px] font-bold text-ink dark:text-ink-dark">
                    {isPublished ? "Đã gửi" : "Đang sửa"}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* ── Timeline ── */}
          <View className="px-5 pt-6">
            <View className="flex-row items-end justify-between">
              <Text className="text-[15px] font-bold text-ink dark:text-ink-dark">
                Lộ trình từng kỳ
              </Text>
              <Text className="text-xs font-semibold" style={{ color: ORANGE }}>
                Chạm để mở rộng
              </Text>
            </View>

            <View className="mt-3">
              {draft.semesters.map((sem, idx) => (
                <TimelineSemester
                  key={sem.semester_id}
                  semester={sem}
                  index={idx}
                  isLast={idx === draft.semesters.length - 1}
                  isDark={isDark}
                  open={expanded[sem.semester_id] ?? false}
                  onToggle={() => toggle(sem.semester_id)}
                  onRemove={(courseId) => removeCourse(sem.semester_id, courseId)}
                  onAdd={() => {
                    setAddTarget(sem.semester_id);
                    setSheetQuery("");
                  }}
                />
              ))}
            </View>

            <Text className="mt-4 text-center text-[11px] leading-4 text-ink-faint dark:text-ink-faint-dark">
              Mẹo: giữ mỗi kỳ 14–18 tín chỉ để đảm bảo tiến độ tốt nghiệp.
            </Text>
          </View>
        </ScrollView>

        {/* ── Notice toast ── */}
        {notice ? (
          <View className="absolute left-5 right-5 top-2 items-center" pointerEvents="none">
            <View
              className="rounded-full px-4 py-2.5"
              style={{ backgroundColor: isDark ? "#1B1815" : "#191512" }}
            >
              <Text className="text-xs font-semibold text-white">{notice}</Text>
            </View>
          </View>
        ) : null}

        {/* ── Sticky action bar ── */}
        <View
          className="absolute bottom-0 left-0 right-0 border-t border-line bg-surface px-5 pb-6 pt-3 dark:border-line-dark dark:bg-surface-dark"
          style={{ backgroundColor: isDark ? "#1B1815" : "#FFFFFF" }}
        >
          <View className="flex-row gap-3">
            <Pressable
              onPress={handleSave}
              disabled={!dirty || saveDraft.isPending}
              accessibilityRole="button"
              accessibilityLabel="Lưu bản nháp"
              className="flex-1 items-center justify-center rounded-2xl border border-line py-4 active:opacity-70 dark:border-line-dark"
              style={{ opacity: !dirty || saveDraft.isPending ? 0.5 : 1 }}
            >
              {saveDraft.isPending ? (
                <ActivityIndicator color={ORANGE} size="small" />
              ) : (
                <Text className="text-sm font-bold text-ink dark:text-ink-dark">
                  Lưu nháp{dirty ? " •" : ""}
                </Text>
              )}
            </Pressable>
            <Pressable
              onPress={handleSubmit}
              disabled={publish.isPending || saveDraft.isPending}
              accessibilityRole="button"
              accessibilityLabel="Gửi duyệt cho cố vấn"
              className="flex-[1.4] flex-row items-center justify-center gap-2 rounded-2xl py-4 active:opacity-85"
              style={{
                backgroundColor: ORANGE,
                opacity: publish.isPending ? 0.7 : 1,
              }}
            >
              {publish.isPending ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <MaterialCommunityIcons name="send" size={17} color="#fff" />
                  <Text className="text-sm font-bold text-white">Gửi duyệt</Text>
                </>
              )}
            </Pressable>
          </View>
          <Text className="mt-2 text-center text-[11px] text-ink-faint dark:text-ink-faint-dark">
            Gửi tới {advisorName} · phản hồi trong 1–2 ngày làm việc
          </Text>
        </View>
      </View>

      {/* ── Add-course sheet ── */}
      <Sheet open={!!addTarget} onClose={() => setAddTarget(null)} maxHeightRatio={0.85}>
        <AddCourseSheet
          semesterLabel={
            draft.semesters.find((s) => s.semester_id === addTarget)?.semester_label ?? ""
          }
          query={sheetQuery}
          onQuery={setSheetQuery}
          candidates={candidates}
          onAdd={(c) => {
            if (addTarget) addCourse(addTarget, c);
          }}
          onDone={() => setAddTarget(null)}
        />
      </Sheet>
    </SafeAreaView>
  );
}

// ─── Timeline semester (one node) ────────────────────────────────────────────

function TimelineSemester({
  semester,
  index,
  isLast,
  isDark,
  open,
  onToggle,
  onRemove,
  onAdd,
}: {
  semester: StudyPlan["semesters"][number];
  index: number;
  isLast: boolean;
  isDark: boolean;
  open: boolean;
  onToggle: () => void;
  onRemove: (courseId: string) => void;
  onAdd: () => void;
}) {
  const semCredits = semester.courses.reduce((s, c) => s + c.credits, 0);
  const isCurrent = index === 0;

  return (
    <View className="flex-row gap-3">
      {/* Rail */}
      <View className="items-center" style={{ width: 28 }}>
        <View
          className="items-center justify-center rounded-full"
          style={{
            width: 28,
            height: 28,
            backgroundColor: isCurrent ? ORANGE : isDark ? "#1B1815" : "#FFFFFF",
            borderWidth: isCurrent ? 0 : 2,
            borderColor: isCurrent ? "transparent" : isDark ? "#302A24" : "#EAE1D8",
          }}
        >
          {isCurrent ? (
            <MaterialCommunityIcons name="star" size={14} color="#fff" />
          ) : (
            <Text
              className="text-[11px] font-bold tabular-nums"
              style={{ color: isDark ? "#A79C93" : "#8B8178" }}
            >
              {index + 1}
            </Text>
          )}
        </View>
        {!isLast && (
          <View
            className="w-[2px] flex-1"
            style={{
              backgroundColor: isDark ? "#302A24" : "#EAE1D8",
              minHeight: 24,
              marginVertical: 4,
            }}
          />
        )}
      </View>

      {/* Card */}
      <View className="flex-1 pb-4">
        <View className="overflow-hidden rounded-3xl border border-line bg-surface dark:border-line-dark dark:bg-surface-dark">
          <Pressable onPress={onToggle} accessibilityRole="button" className="p-4 active:opacity-80">
            <View className="flex-row items-center justify-between gap-2">
              <View className="flex-1">
                <View className="flex-row items-center gap-2">
                  <Text className="text-[15px] font-bold text-ink dark:text-ink-dark" numberOfLines={1}>
                    {semester.semester_label}
                  </Text>
                  {isCurrent ? (
                    <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: "#FFF1E7" }}>
                      <Text className="text-[10px] font-bold" style={{ color: ORANGE_DEEP }}>
                        HIỆN TẠI
                      </Text>
                    </View>
                  ) : null}
                </View>
                <Text className="mt-1 text-[11px] text-ink-muted dark:text-ink-muted-dark tabular-nums">
                  {semester.courses.length} môn · {semCredits} tín chỉ · GPA {semester.projected_gpa.toFixed(2)}
                </Text>
              </View>
              <MaterialCommunityIcons
                name={open ? "chevron-up" : "chevron-down"}
                size={20}
                color={isDark ? "#A79C93" : "#8B8178"}
              />
            </View>
          </Pressable>

          {open && (
            <View className="px-4 pb-4">
              <View className="h-px bg-rule dark:bg-rule-dark" />
              {semester.courses.length === 0 ? (
                <View
                  className="mt-3 items-center rounded-2xl border border-dashed px-4 py-5"
                  style={{ borderColor: isDark ? "#302A24" : "#EAE1D8" }}
                >
                  <Text className="text-xs text-ink-muted dark:text-ink-muted-dark">
                    Kỳ này chưa có môn nào
                  </Text>
                </View>
              ) : (
                <View className="mt-1">
                  {semester.courses.map((c, i) => (
                    <View key={c.course_id}>
                      <View className="flex-row items-center gap-3 py-3">
                        <View className="flex-1">
                          <View className="flex-row items-center gap-2">
                            <Text
                              className="text-[11px] font-bold tracking-wide tabular-nums"
                              style={{ color: ORANGE_DEEP }}
                            >
                              {c.course_code}
                            </Text>
                            <View className="rounded-full bg-raised px-2 py-0.5 dark:bg-raised-dark">
                              <Text className="text-[10px] font-bold text-ink-muted dark:text-ink-muted-dark tabular-nums">
                                {c.credits} TC
                              </Text>
                            </View>
                          </View>
                          <Text
                            className="mt-1 text-[14px] font-semibold leading-5 text-ink dark:text-ink-dark"
                            numberOfLines={2}
                          >
                            {c.course_name}
                          </Text>
                          {c.reason ? (
                            <Text
                              className="mt-0.5 text-[11px] leading-4 text-ink-faint dark:text-ink-faint-dark"
                              numberOfLines={2}
                            >
                              {c.reason}
                            </Text>
                          ) : null}
                        </View>
                        <Pressable
                          onPress={() => onRemove(c.course_id)}
                          hitSlop={12}
                          accessibilityRole="button"
                          accessibilityLabel={`Xóa ${c.course_code} khỏi kế hoạch`}
                          className="h-10 w-10 items-center justify-center rounded-full active:opacity-70"
                          style={{ backgroundColor: isDark ? "#241F1B" : "#F2EDE7" }}
                        >
                          <MaterialCommunityIcons name="trash-can-outline" size={18} color="#B5460D" />
                        </Pressable>
                      </View>
                      {i < semester.courses.length - 1 && (
                        <View className="h-px bg-rule dark:bg-rule-dark" />
                      )}
                    </View>
                  ))}
                </View>
              )}

              <Pressable
                onPress={onAdd}
                accessibilityRole="button"
                accessibilityLabel={`Thêm môn vào ${semester.semester_label}`}
                className="mt-3 flex-row items-center justify-center gap-2 rounded-2xl border border-dashed py-3.5 active:opacity-70"
                style={{ borderColor: ORANGE }}
              >
                <MaterialCommunityIcons name="plus" size={17} color={ORANGE} />
                <Text className="text-[13px] font-bold" style={{ color: ORANGE }}>
                  Thêm môn vào kỳ này
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

// ─── Add sheet ───────────────────────────────────────────────────────────────

function AddCourseSheet({
  semesterLabel,
  query,
  onQuery,
  candidates,
  onAdd,
  onDone,
}: {
  semesterLabel: string;
  query: string;
  onQuery: (q: string) => void;
  candidates: { id: string; code: string; name: string; credits: number }[];
  onAdd: (c: { id: string; code: string; name: string; credits: number }) => void;
  onDone: () => void;
}) {
  const [addedId, setAddedId] = useState<string | null>(null);

  return (
    <View>
      <Text className="text-lg font-bold text-ink dark:text-ink-dark">Thêm môn học</Text>
      <Text className="mt-1 text-[13px] text-ink-muted dark:text-ink-muted-dark">
        Vào {semesterLabel} · chạm dấu cộng để thêm ngay
      </Text>

      <View className="mt-4 flex-row items-center gap-2 rounded-2xl border border-line bg-surface px-3 py-2.5 dark:border-line-dark">
        <MaterialCommunityIcons name="magnify" size={18} color="#8B8178" />
        <TextInput
          value={query}
          onChangeText={onQuery}
          placeholder="Tìm theo mã hoặc tên môn…"
          placeholderTextColor="#8B8178"
          autoCapitalize="none"
          autoCorrect={false}
          className="flex-1 text-sm text-ink dark:text-ink-dark"
        />
        {query.length > 0 && (
          <Pressable onPress={() => onQuery("")} hitSlop={8}>
            <MaterialCommunityIcons name="close-circle" size={18} color="#8B8178" />
          </Pressable>
        )}
      </View>

      {candidates.length === 0 ? (
        <View className="items-center py-10">
          <MaterialCommunityIcons name="book-search-outline" size={40} color="#CBD5E1" />
          <Text className="mt-3 text-center text-sm text-ink-muted dark:text-ink-muted-dark">
            Không còn môn gợi ý nào khớp. Thử từ khóa khác.
          </Text>
        </View>
      ) : (
        <View className="mt-3 gap-2 pb-2">
          {candidates.map((c) => {
            const justAdded = addedId === c.id;
            return (
              <View
                key={c.id}
                className="flex-row items-center gap-3 rounded-2xl border border-line p-3 dark:border-line-dark"
              >
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-[11px] font-bold" style={{ color: ORANGE_DEEP }}>
                      {c.code}
                    </Text>
                    <Text className="text-[11px] text-ink-faint dark:text-ink-faint-dark tabular-nums">
                      {c.credits} TC
                    </Text>
                  </View>
                  <Text className="mt-0.5 text-sm font-semibold text-ink dark:text-ink-dark" numberOfLines={2}>
                    {c.name}
                  </Text>
                </View>
                <Pressable
                  onPress={() => {
                    onAdd(c);
                    setAddedId(c.id);
                    setTimeout(() => setAddedId(null), 1200);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Thêm ${c.code}`}
                  className="h-10 w-10 items-center justify-center rounded-full active:opacity-80"
                  style={{ backgroundColor: justAdded ? "#16A34A" : ORANGE }}
                >
                  <MaterialCommunityIcons
                    name={justAdded ? "check" : "plus"}
                    size={20}
                    color="#fff"
                  />
                </Pressable>
              </View>
            );
          })}
        </View>
      )}

      <Pressable
        onPress={onDone}
        className="mt-2 items-center rounded-2xl bg-raised py-4 active:opacity-80 dark:bg-raised-dark"
      >
        <Text className="text-sm font-bold text-ink dark:text-ink-dark">Xong</Text>
      </Pressable>
    </View>
  );
}

function PlanSkeleton() {
  return (
    <View className="px-5 pt-4">
      <Skeleton height={220} className="rounded-[28px]" />
      <View className="mt-4 flex-row gap-3">
        <Skeleton height={76} className="flex-1 rounded-3xl" />
        <Skeleton height={76} className="flex-1 rounded-3xl" />
        <Skeleton height={76} className="flex-1 rounded-3xl" />
      </View>
      <View className="mt-6 gap-3">
        <Skeleton height={110} className="rounded-3xl" />
        <Skeleton height={110} className="rounded-3xl" />
        <Skeleton height={110} className="rounded-3xl" />
      </View>
      <View className="mt-6 items-center">
        <ActivityIndicator color={ORANGE} />
      </View>
    </View>
  );
}
