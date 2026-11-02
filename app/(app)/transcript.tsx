/**
 * FE-S-3 — Bảng điểm (Transcript) & Tiến độ học tập.
 *
 * Câu hỏi duy nhất của màn hình: "Tôi đang đứng ở đâu — điểm các kỳ ra sao,
 * còn bao nhiêu tín chỉ nữa thì tốt nghiệp, và OJT tới đâu rồi?"
 *
 * Layout một tay: banner cảnh báo → hero GPA/tín chỉ → OJT → từng học kỳ
 * dạng accordion. Mọi token theo theme "mới" (ground/surface/brand-tint),
 * dark-mode đầy đủ qua `dark:` variants + inline style theo `isDark`.
 */

import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";

import { ScreenHeader, goBack } from "@/components/ScreenHeader";
import { Skeleton } from "@/components/ui";
import { useMyProfile } from "@/lib/queries/profile";
import { useTranscript } from "@/lib/queries/transcript";
import { useAuthStore } from "@/stores/auth";
import type {
  OjtStatus,
  TranscriptCourseGrade,
  TranscriptSemester,
} from "@/lib/api/transcript";

const ORANGE = "#F36F21";
const ORANGE_DEEP = "#B5460D";

// ── Semantic tones ───────────────────────────────────────────────────────────
// Probation/warning dùng hổ phách (amber) — cảnh báo nhưng không "lỗi".
// Điểm rớt mới dùng đỏ. Điểm tốt dùng xanh lá. Tất cả có cặp light/dark.

function gradeTone(grade: number, isDark: boolean): { bg: string; fg: string } {
  if (grade >= 8) {
    return isDark
      ? { bg: "#0B2E1F", fg: "#6EE7B7" }
      : { bg: "#DCFCE7", fg: "#047857" };
  }
  if (grade >= 6.5) {
    return isDark
      ? { bg: "#2E1C0E", fg: "#FFA371" }
      : { bg: "#FFF1E7", fg: ORANGE_DEEP };
  }
  if (grade >= 5) {
    return isDark
      ? { bg: "#3A2A0A", fg: "#FCD34D" }
      : { bg: "#FEF3C7", fg: "#92400E" };
  }
  return isDark
    ? { bg: "#3B0F0F", fg: "#FCA5A5" }
    : { bg: "#FEE2E2", fg: "#DC2626" };
}

const OJT_META: Record<
  OjtStatus,
  { label: string; icon: string; bg: string; fg: string; darkBg: string; darkFg: string }
> = {
  completed: {
    label: "Đã hoàn thành",
    icon: "check-decagram",
    bg: "#DCFCE7",
    fg: "#047857",
    darkBg: "#0B2E1F",
    darkFg: "#6EE7B7",
  },
  in_progress: {
    label: "Đang thực hiện",
    icon: "briefcase-clock-outline",
    bg: "#FEF3C7",
    fg: "#92400E",
    darkBg: "#3A2A0A",
    darkFg: "#FCD34D",
  },
  not_eligible: {
    label: "Chưa đủ điều kiện",
    icon: "briefcase-off-outline",
    bg: "#F2EDE7",
    fg: "#6A6058",
    darkBg: "#241F1B",
    darkFg: "#A79C93",
  },
};

export default function TranscriptScreen() {
  const isDark = useColorScheme() === "dark";
  const userId = useAuthStore((s) => s.session?.user.id ?? null);

  const { data: profile } = useMyProfile(userId);
  const {
    data: transcript,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useTranscript();

  // Mở sẵn kỳ mới nhất, các kỳ cũ thu gọn để màn hình gọn một tay.
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  useEffect(() => {
    if (transcript && Object.keys(expanded).length === 0) {
      const init: Record<string, boolean> = {};
      transcript.semesters.forEach((s, i) => {
        init[s.id] = i === transcript.semesters.length - 1;
      });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setExpanded(init);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript]);

  const stats = useMemo(() => {
    if (!transcript) return null;
    let attempted = 0;
    let weighted = 0;
    let earned = 0;
    let courses = 0;
    let failed = 0;
    for (const sem of transcript.semesters) {
      for (const c of sem.courses) {
        attempted += c.credits;
        weighted += c.grade * c.credits;
        courses += 1;
        if (c.status === "PASSED") earned += c.credits;
        else failed += 1;
      }
    }
    return {
      attempted,
      earned,
      courses,
      failed,
      gpa: attempted === 0 ? 0 : Math.round((weighted / attempted) * 100) / 100,
    };
  }, [transcript]);

  // Số liệu tốt nghiệp lấy từ hồ sơ chính thức (đồng bộ với Trang chủ),
  // không tự tính lại từ 4 kỳ mẫu để khỏi lệch số.
  const grad = useMemo(() => {
    if (!profile) return null;
    const earned = profile.student.total_credits_earned;
    const total = profile.major.total_credits;
    const pct = total === 0 ? 0 : Math.min(100, Math.round((earned / total) * 100));
    return { earned, total, pct, left: Math.max(0, total - earned) };
  }, [profile]);

  if (isLoading || !transcript || !stats) {
    return (
      <SafeAreaView className="flex-1 bg-ground dark:bg-ground-dark" edges={["top"]}>
        <ScreenHeader
          title="Bảng điểm"
          subtitle="Kết quả học tập & tiến độ tốt nghiệp"
          onBack={goBack}
        />
        <View className="px-5 pt-4">
          <Skeleton height={210} className="rounded-[28px]" />
          <Skeleton height={120} className="mt-4 rounded-3xl" />
          <Skeleton height={76} className="mt-4 rounded-3xl" />
          <Skeleton height={76} className="mt-3 rounded-3xl" />
          <View className="mt-6 items-center">
            <ActivityIndicator color={ORANGE} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1 bg-ground dark:bg-ground-dark" edges={["top"]}>
        <ScreenHeader title="Bảng điểm" subtitle="Kết quả học tập & tiến độ tốt nghiệp" onBack={goBack} />
        <View className="flex-1 items-center justify-center px-8">
          <MaterialCommunityIcons name="cloud-off-outline" size={44} color="#CBD5E1" />
          <Text className="mt-3 text-center text-sm text-ink-muted dark:text-ink-muted-dark">
            Không tải được bảng điểm. Kéo xuống để thử lại.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const onProbation = profile?.student.academic_status === "PROBATION";
  const failedCourses = transcript.semesters.flatMap((s) =>
    s.courses.filter((c) => c.status === "FAILED").map((c) => c.course_code),
  );

  return (
    <SafeAreaView className="flex-1 bg-ground dark:bg-ground-dark" edges={["top"]}>
      <ScreenHeader
        title="Bảng điểm"
        subtitle={`${profile?.student.student_code ?? ""} · ${profile?.curriculum_version.name ?? ""}`}
        onBack={goBack}
        right={
          <View
            className="rounded-full px-3 py-1.5"
            style={{ backgroundColor: isDark ? "#2E1C0E" : "#FFF1E7" }}
          >
            <Text className="text-[11px] font-bold" style={{ color: isDark ? "#FFA371" : ORANGE_DEEP }}>
              {transcript.semesters.length} kỳ · {stats.courses} môn
            </Text>
          </View>
        }
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => { refetch(); }} tintColor={ORANGE} />
        }
      >
        {/* ── 1. Cảnh báo học vụ — luôn đứng đầu khi bị PROBATION ── */}
        {onProbation ? (
          <View className="px-5 pt-4">
            <View
              className="overflow-hidden rounded-3xl border p-4"
              style={{
                backgroundColor: isDark ? "#2A1E05" : "#FFFBEB",
                borderColor: isDark ? "#B45309" : "#F59E0B",
              }}
            >
              <View className="flex-row items-center gap-3">
                <View
                  className="h-11 w-11 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: "#F59E0B" }}
                >
                  <MaterialCommunityIcons name="alert-decagram" size={22} color="#FFFFFF" />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-sm font-bold"
                    style={{ color: isDark ? "#FCD34D" : "#92400E" }}
                  >
                    Cảnh báo học vụ · PROBATION
                  </Text>
                  <Text
                    className="mt-0.5 text-[11px] leading-4"
                    style={{ color: isDark ? "#E7C46B" : "#92600E" }}
                  >
                    GPA kỳ Summer 2025 chỉ 5.75 do trượt {failedCourses.join(", ")}.
                    Gặp advisor để lập kế hoạch cải thiện trước kỳ đăng ký mới.
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => router.push("/(app)/advising")}
                accessibilityRole="button"
                accessibilityLabel="Trao đổi với advisor về cảnh báo học vụ"
                className="mt-3 flex-row items-center justify-center gap-2 rounded-2xl py-3 active:opacity-85"
                style={{ backgroundColor: "#F59E0B" }}
              >
                <MaterialCommunityIcons name="chat-outline" size={16} color="#FFFFFF" />
                <Text className="text-[13px] font-bold text-white">
                  Trao đổi với advisor
                </Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {/* ── 2. Hero: GPA tích lũy + tiến độ tín chỉ (flat orange) ── */}
        <View className="px-5 pt-4">
          <View className="overflow-hidden rounded-[28px] p-5" style={{ backgroundColor: ORANGE }}>
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
              <View className="rounded-full px-3 py-1.5" style={{ backgroundColor: "rgba(255,255,255,0.22)" }}>
                <Text className="text-[11px] font-bold text-white">
                  Tích lũy · {stats.courses} môn
                </Text>
              </View>
              <View className="rounded-full px-3 py-1.5" style={{ backgroundColor: "rgba(255,255,255,0.22)" }}>
                <Text className="text-[11px] font-bold text-white">
                  {stats.gpa >= 8 ? "Giỏi" : stats.gpa >= 6.5 ? "Khá" : stats.gpa >= 5 ? "Trung bình" : "Cần cố gắng"}
                </Text>
              </View>
            </View>

            <View className="mt-4 flex-row items-end justify-between">
              <View>
                <Text className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.85)" }}>
                  GPA tích lũy
                </Text>
                <View className="flex-row items-baseline gap-1">
                  <Text className="text-[52px] font-bold leading-[56px] text-white tabular-nums">
                    {stats.gpa.toFixed(2)}
                  </Text>
                  <Text className="text-base font-medium" style={{ color: "rgba(255,255,255,0.8)" }}>
                    / 10
                  </Text>
                </View>
              </View>
              <View className="items-end pb-1">
                <Text className="text-2xl font-bold text-white tabular-nums">
                  {grad?.earned ?? stats.earned}
                  <Text className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.8)" }}>
                    /{grad?.total ?? 150}
                  </Text>
                </Text>
                <Text className="text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.85)" }}>
                  tín chỉ đã tích lũy
                </Text>
              </View>
            </View>

            <View className="mt-3 h-2.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.3)" }}>
              <View className="h-full rounded-full bg-white" style={{ width: `${grad?.pct ?? 0}%` }} />
            </View>
            <Text className="mt-2 text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.9)" }}>
              Hoàn thành {grad?.pct ?? 0}% · còn {grad?.left ?? 0} tín chỉ nữa tốt nghiệp
            </Text>
          </View>
        </View>

        {/* ── 3. OJT — widget trạng thái thực tập ── */}
        <View className="px-5 pt-4">
          <OjtCard isDark={isDark} />
        </View>

        {/* ── 4. Bảng điểm từng kỳ ── */}
        <View className="px-5 pt-6">
          <View className="flex-row items-end justify-between">
            <Text className="text-[15px] font-bold text-ink dark:text-ink-dark">
              Điểm theo học kỳ
            </Text>
            {stats.failed > 0 ? (
              <Text className="text-[11px] font-bold" style={{ color: "#DC2626" }}>
                {stats.failed} môn chưa đạt
              </Text>
            ) : null}
          </View>

          <View className="mt-3 gap-3">
            {transcript.semesters.map((sem) => (
              <SemesterCard
                key={sem.id}
                semester={sem}
                isDark={isDark}
                open={!!expanded[sem.id]}
                onToggle={() => setExpanded((p) => ({ ...p, [sem.id]: !p[sem.id] }))}
              />
            ))}
          </View>

          <Text className="mt-4 text-center text-[11px] leading-4 text-ink-faint dark:text-ink-faint-dark">
            Điểm thang 10 · Môn dưới 5.00 được tính là chưa đạt và phải học lại
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── OJT ──────────────────────────────────────────────────────────────────────

function OjtCard({ isDark }: { isDark: boolean }) {
  const { data: transcript } = useTranscript();
  const ojt = transcript?.ojt;
  if (!ojt) return null;
  const meta = OJT_META[ojt.status];

  return (
    <View className="rounded-3xl border border-line bg-surface p-4 dark:border-line-dark dark:bg-surface-dark">
      <View className="flex-row items-center gap-3">
        <View
          className="h-11 w-11 items-center justify-center rounded-2xl"
          style={{ backgroundColor: isDark ? meta.darkBg : meta.bg }}
        >
          <MaterialCommunityIcons
            name={meta.icon as any}
            size={22}
            color={isDark ? meta.darkFg : meta.fg}
          />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-bold text-ink dark:text-ink-dark">
            Thực tập tốt nghiệp (OJT)
          </Text>
          <Text className="mt-0.5 text-[11px] text-ink-muted dark:text-ink-muted-dark" numberOfLines={1}>
            {ojt.course_code} · {ojt.course_name}
          </Text>
        </View>
        <View
          className="rounded-full px-3 py-1.5"
          style={{ backgroundColor: isDark ? meta.darkBg : meta.bg }}
        >
          <Text className="text-[11px] font-bold" style={{ color: isDark ? meta.darkFg : meta.fg }}>
            {meta.label}
          </Text>
        </View>
      </View>

      <View className="mt-3 rounded-2xl bg-raised p-3 dark:bg-raised-dark">
        {ojt.company ? (
          <View className="flex-row items-center gap-2">
            <MaterialCommunityIcons name="office-building-outline" size={15} color={isDark ? "#A79C93" : "#6A6058"} />
            <Text className="flex-1 text-xs font-semibold text-ink dark:text-ink-dark" numberOfLines={1}>
              {ojt.company}
            </Text>
          </View>
        ) : null}
        {ojt.mentor ? (
          <View className="mt-1.5 flex-row items-center gap-2">
            <MaterialCommunityIcons name="account-tie-outline" size={15} color={isDark ? "#A79C93" : "#6A6058"} />
            <Text className="flex-1 text-xs text-ink-muted dark:text-ink-muted-dark" numberOfLines={1}>
              {ojt.mentor}
            </Text>
          </View>
        ) : null}
        <Text className="mt-1.5 text-[11px] leading-4 text-ink-faint dark:text-ink-faint-dark">
          {ojt.note}
        </Text>
        {ojt.status === "in_progress" && typeof ojt.progress_pct === "number" ? (
          <View className="mt-2.5">
            <View className="flex-row items-center justify-between">
              <Text className="text-[11px] font-bold" style={{ color: ORANGE_DEEP }}>
                Tiến độ thực tập
              </Text>
              <Text className="text-[11px] font-bold tabular-nums" style={{ color: ORANGE_DEEP }}>
                {ojt.progress_pct}%
              </Text>
            </View>
            <View className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-line dark:bg-line-dark">
              <View className="h-full rounded-full" style={{ width: `${ojt.progress_pct}%`, backgroundColor: ORANGE }} />
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}

// ── Semester accordion ───────────────────────────────────────────────────────

function SemesterCard({
  semester,
  isDark,
  open,
  onToggle,
}: {
  semester: TranscriptSemester;
  isDark: boolean;
  open: boolean;
  onToggle: () => void;
}) {
  const credits = semester.courses.reduce((s, c) => s + c.credits, 0);
  const tone = gradeTone(semester.term_gpa, isDark);

  return (
    <View className="overflow-hidden rounded-3xl border border-line bg-surface dark:border-line-dark dark:bg-surface-dark">
      <Pressable
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityLabel={`${open ? "Thu gọn" : "Mở"} bảng điểm ${semester.label}`}
        className="flex-row items-center gap-3 p-4 active:opacity-80"
      >
        <View
          className="h-11 w-11 items-center justify-center rounded-2xl"
          style={{ backgroundColor: isDark ? "#241F1B" : "#F2EDE7" }}
        >
          <MaterialCommunityIcons
            name="calendar-month-outline"
            size={22}
            color={isDark ? "#FFA371" : ORANGE}
          />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-bold text-ink dark:text-ink-dark">
            {semester.label}
          </Text>
          <Text className="mt-0.5 text-[11px] text-ink-muted dark:text-ink-muted-dark">
            {semester.courses.length} môn · {credits} tín chỉ
          </Text>
        </View>
        <View className="rounded-full px-3 py-1.5" style={{ backgroundColor: tone.bg }}>
          <Text className="text-[12px] font-bold tabular-nums" style={{ color: tone.fg }}>
            {semester.term_gpa.toFixed(2)}
          </Text>
        </View>
        <MaterialCommunityIcons
          name={open ? "chevron-up" : "chevron-down"}
          size={20}
          color={isDark ? "#A79C93" : "#8B8178"}
        />
      </Pressable>

      {open ? (
        <View className="px-4 pb-2">
          <View className="h-px bg-rule dark:bg-rule-dark" />
          {semester.courses.map((c, i) => (
            <CourseRow
              key={c.course_code}
              course={c}
              isDark={isDark}
              last={i === semester.courses.length - 1}
            />
          ))}
          <View className="flex-row items-center justify-between py-3">
            <Text className="text-[11px] font-medium text-ink-muted dark:text-ink-muted-dark">
              GPA kỳ {semester.label}
            </Text>
            <Text className="text-[13px] font-bold tabular-nums" style={{ color: tone.fg }}>
              {semester.term_gpa.toFixed(2)}
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

function CourseRow({
  course,
  isDark,
  last,
}: {
  course: TranscriptCourseGrade;
  isDark: boolean;
  last: boolean;
}) {
  const tone = gradeTone(course.grade, isDark);
  const failed = course.status === "FAILED";

  return (
    <View
      className={`flex-row items-center gap-3 py-3 ${last ? "" : "border-b border-rule dark:border-rule-dark"}`}
    >
      <View className="flex-1">
        <View className="flex-row items-center gap-2">
          <Text className="text-[13px] font-bold text-ink dark:text-ink-dark tabular-nums">
            {course.course_code}
          </Text>
          {failed ? (
            <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: tone.bg }}>
              <Text className="text-[10px] font-bold" style={{ color: tone.fg }}>
                Rớt
              </Text>
            </View>
          ) : null}
        </View>
        <Text
          className="mt-0.5 text-[12px] leading-4 text-ink-muted dark:text-ink-muted-dark"
          numberOfLines={2}
        >
          {course.course_name}
        </Text>
        <Text className="mt-0.5 text-[11px] text-ink-faint dark:text-ink-faint-dark tabular-nums">
          {course.credits} tín chỉ
        </Text>
      </View>
      <View
        className="min-w-[56px] items-center rounded-2xl px-2.5 py-2"
        style={{ backgroundColor: tone.bg }}
      >
        <Text className="text-[15px] font-bold tabular-nums" style={{ color: tone.fg }}>
          {course.grade.toFixed(1)}
        </Text>
      </View>
    </View>
  );
}
