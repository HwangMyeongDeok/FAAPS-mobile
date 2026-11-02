/**
 * FE-S-9 — Lộ trình học tập AI (AI suggested curriculum roadmap).
 *
 * ── Direction ───────────────────────────────────────────────────────────────
 * Style: framed-sheet (app), mapped onto the FPT brand tokens. One warm
 * ground, white cards with a single hairline edge, no shadows at rest, the
 * orange reserved for the data and the one primary action.
 *
 * The screen's one question: "AI sẽ xếp các kỳ còn lại của tôi như thế nào?"
 * — so the vertical timeline IS the screen, and the summary above it is
 * three numbers, not a grid of tiles.
 *
 * ── Design notes ────────────────────────────────────────────────────────────
 * • A vertical rail carries the terms. Past terms are closed and quiet; the
 *   current term is the one open, orange-marked card; future terms are the
 *   assistant's proposal, marked as such.
 * • Each course row states its credits and, when it has one, its
 *   prerequisite codes — the reason the assistant ordered it that way.
 * • "Tạo lại lộ trình" regenerates under a different constraint and the
 *   screen says what changed, rather than silently swapping the numbers.
 */

import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";

import { goBack } from "@/components/ScreenHeader";
import { aiKeys, useAiRoadmap, useRegenerateAiRoadmap } from "@/lib/queries/ai";
import { useAuthStore } from "@/stores/auth";
import type { AiRoadmapCourse, AiRoadmapRequest, AiRoadmapSemester } from "@/types/ai";

const ORANGE = "#F36F21";
const ORANGE_DEEP = "#B5460D";

/** The label for each course category. */
const CATEGORY_LABEL: Record<string, string> = {
  CORE: "Lõi",
  ELECTIVE: "Chuyên ngành",
  PRACTICUM: "Thực hành",
  PROJECT: "Đồ án",
};

/**
 * The three plans the assistant can produce. "Tạo lại lộ trình" walks
 * through them, so the button always returns a genuinely different plan
 * rather than the same one with a new caption.
 */
const ROADMAP_PLANS: {
  target_gpa: number;
  preferred_terms: number;
  note?: string;
}[] = [
  { target_gpa: 8.5, preferred_terms: 4, note: undefined },
  { target_gpa: 9, preferred_terms: 4, note: "cân bằng khối lượng mỗi kỳ" },
  { target_gpa: 8.5, preferred_terms: 3, note: "ưu tiên môn AI" },
];

export default function AiRoadmapScreen() {
  const isDark = useColorScheme() === "dark";
  const userId = useAuthStore((s) => s.session?.user.id ?? null);
  const qc = useQueryClient();

  const { data: roadmap, isLoading, isError, refetch } = useAiRoadmap(userId);
  const regenerate = useRegenerateAiRoadmap(userId);

  // The term the student is looking at. Starts on the current term, which
  // is the one they actually need to act on.
  const [focusSemester, setFocusSemester] = useState<number | null>(null);

  const currentSemester = useMemo(() => {
    const current = roadmap?.semesters.find((s) => s.status === "current");
    return current?.semester ?? 5;
  }, [roadmap]);

  const onRegenerate = useCallback(() => {
    if (regenerate.isPending) return;
    // Which of the three plans is on screen? The last request the assistant
    // answered is kept in the query cache, so the button keeps its place
    // even after the student leaves the screen and comes back.
    const last = qc.getQueryData<AiRoadmapRequest>(
      aiKeys.roadmapRequest(userId!),
    );
    const index = ROADMAP_PLANS.findIndex(
      (p) =>
        p.target_gpa === last?.target_gpa &&
        p.preferred_terms === last?.preferred_terms &&
        p.note === last?.note,
    );
    // No request cached yet means the default plan is on screen, which is
    // the first one — so the button moves on to the second.
    const next = ROADMAP_PLANS[(Math.max(index, 0) + 1) % ROADMAP_PLANS.length];
    regenerate.mutate({ ...next });
  }, [qc, regenerate, userId]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-ground dark:bg-ground-dark" edges={["top"]}>
        <RoadmapHeader isDark={isDark} isRegenerating={false} onRegenerate={onRegenerate} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={ORANGE} />
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !roadmap) {
    return (
      <SafeAreaView className="flex-1 bg-ground dark:bg-ground-dark" edges={["top"]}>
        <RoadmapHeader isDark={isDark} isRegenerating={false} onRegenerate={onRegenerate} />
        <View className="flex-1 items-center justify-center px-8">
          <MaterialCommunityIcons name="cloud-off-outline" size={40} color="#CBD5E1" />
          <Text className="mt-3 text-center text-sm text-ink-muted dark:text-ink-muted-dark">
            Không tải được lộ trình. Kéo xuống để thử lại.
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

  const remaining = roadmap.semesters.filter((s) => s.status !== "completed");
  const remainingCredits = remaining.reduce(
    (s, sem) => s + sem.courses.reduce((a, c) => a + c.credits, 0),
    0,
  );
  const completedCredits = roadmap.earned_credits;
  const progress =
    roadmap.total_credits === 0
      ? 0
      : Math.round((completedCredits / roadmap.total_credits) * 100);

  return (
    <SafeAreaView className="flex-1 bg-ground dark:bg-ground-dark" edges={["top"]}>
      <RoadmapHeader
        isDark={isDark}
        isRegenerating={regenerate.isPending}
        onRegenerate={onRegenerate}
        subtitle={`${remaining.length} kỳ còn lại · tốt nghiệp ${roadmap.graduation_term}`}
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* ── Summary: three numbers, one divided card ───────────────── */}
        <View className="px-5 pt-4">
          <View className="flex-row rounded-3xl border border-line bg-surface dark:border-line-dark dark:bg-surface-dark">
            <View className="flex-1 items-center px-2 py-4">
              <Text className="text-[11px] font-medium text-ink-muted dark:text-ink-muted-dark">
                Còn lại
              </Text>
              <Text className="mt-1 text-xl font-bold text-ink tabular-nums dark:text-ink-dark">
                {remainingCredits}
                <Text className="text-[11px] font-medium text-ink-faint dark:text-ink-faint-dark">
                  {" "}
                  TC
                </Text>
              </Text>
            </View>
            <View className="w-px bg-line dark:bg-line-dark" />
            <View className="flex-1 items-center px-2 py-4">
              <Text className="text-[11px] font-medium text-ink-muted dark:text-ink-muted-dark">
                GPA dự kiến
              </Text>
              <Text className="mt-1 text-xl font-bold text-ink tabular-nums dark:text-ink-dark">
                {roadmap.projected_gpa.toFixed(2)}
              </Text>
            </View>
            <View className="w-px bg-line dark:bg-line-dark" />
            <View className="flex-1 items-center px-2 py-4">
              <Text className="text-[11px] font-medium text-ink-muted dark:text-ink-muted-dark">
                Đã tích lũy
              </Text>
              <Text className="mt-1 text-xl font-bold text-ink tabular-nums dark:text-ink-dark">
                {completedCredits}
                <Text className="text-[11px] font-medium text-ink-faint dark:text-ink-faint-dark">
                  /{roadmap.total_credits}
                </Text>
              </Text>
            </View>
          </View>
        </View>

        {/* ── The strategy line — what the assistant optimised for ──── */}
        <View className="px-5 pt-3">
          <View className="flex-row items-start gap-2.5 rounded-2xl bg-brand-tint px-4 py-3 dark:bg-brand-tint-dark">
            <MaterialCommunityIcons
              name="creation-outline"
              size={16}
              color={isDark ? "#FFA371" : ORANGE_DEEP}
              style={{ marginTop: 1 }}
            />
            <View className="flex-1">
              <Text className="text-[12px] font-bold text-ink dark:text-ink-dark">
                Chiến lược của AI
              </Text>
              <Text className="mt-0.5 text-[12px] leading-[17px] text-ink-muted dark:text-ink-muted-dark">
                {roadmap.strategy}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Progress to graduation ─────────────────────────────────── */}
        <View className="px-5 pt-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-[12px] font-semibold text-ink-muted dark:text-ink-muted-dark">
              Tiến độ chương trình
            </Text>
            <Text className="text-[12px] font-bold text-ink tabular-nums dark:text-ink-dark">
              {progress}%
            </Text>
          </View>
          <View
            className="mt-2 h-2 w-full overflow-hidden rounded-full"
            style={{ backgroundColor: isDark ? "#302A24" : "#EAE1D8" }}
          >
            <View
              className="h-full rounded-full"
              style={{ width: `${progress}%`, backgroundColor: ORANGE }}
            />
          </View>
        </View>

        {/* ── The vertical timeline ──────────────────────────────────── */}
        <View className="px-5 pt-6">
          <Text className="text-[15px] font-bold text-ink dark:text-ink-dark">
            Lộ trình từng kỳ
          </Text>
          <Text className="mt-0.5 text-[12px] text-ink-muted dark:text-ink-muted-dark">
            {roadmap.semesters.length} kỳ · chạm một kỳ để mở danh sách môn
          </Text>

          <View className="mt-4">
            {roadmap.semesters.map((semester, index) => (
              <TermNode
                key={semester.semester}
                semester={semester}
                isLast={index === roadmap.semesters.length - 1}
                isDark={isDark}
                open={
                  focusSemester === semester.semester ||
                  (focusSemester === null && semester.semester === currentSemester)
                }
                onToggle={() =>
                  setFocusSemester((prev) =>
                    prev === semester.semester ? null : semester.semester,
                  )
                }
                onCoursePress={() => router.push("/(app)/courses")}
              />
            ))}
          </View>
        </View>

        {/* ── Regenerating state ─────────────────────────────────────── */}
        {regenerate.isPending ? (
          <View className="absolute inset-0 items-center justify-center bg-ground/70 dark:bg-ground-dark/70">
            <View className="items-center rounded-3xl border border-line bg-surface px-7 py-6 dark:border-line-dark dark:bg-surface-dark">
              <ActivityIndicator color={ORANGE} />
              <Text className="mt-3 text-[13px] font-bold text-ink dark:text-ink-dark">
                AI đang tính lại lộ trình…
              </Text>
              <Text className="mt-1 text-center text-[11px] text-ink-muted dark:text-ink-muted-dark">
                Đang tối ưu thứ tự môn theo ràng buộc mới
              </Text>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Header
// ═══════════════════════════════════════════════════════════════════════════

function RoadmapHeader({
  isDark,
  isRegenerating,
  onRegenerate,
  subtitle,
}: {
  isDark: boolean;
  isRegenerating: boolean;
  onRegenerate: () => void;
  subtitle?: string;
}) {
  return (
    <View className="border-b border-line bg-surface px-4 pb-3 pt-2 dark:border-line-dark dark:bg-surface-dark">
      <View className="flex-row items-center gap-2">
        <Pressable
          onPress={goBack}
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
          hitSlop={10}
          className="-ml-1 h-10 w-10 items-center justify-center rounded-full active:opacity-70"
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={26}
            color={isDark ? "#F7F2EC" : "#191512"}
          />
        </Pressable>

        <View className="flex-1">
          <Text
            accessibilityRole="header"
            className="text-[17px] font-bold text-ink dark:text-ink-dark"
          >
            Lộ trình học tập AI
          </Text>
          <Text className="text-[11px] text-ink-muted dark:text-ink-muted-dark">
            {subtitle ?? "Gợi ý của AI theo chương trình K19"}
          </Text>
        </View>

        {/* The one primary action on this screen. */}
        <Pressable
          onPress={onRegenerate}
          disabled={isRegenerating}
          accessibilityRole="button"
          accessibilityLabel="Tạo lại lộ trình"
          className="flex-row items-center gap-1.5 rounded-full px-3.5 py-2.5 active:opacity-80"
          style={{
            backgroundColor: ORANGE,
            opacity: isRegenerating ? 0.7 : 1,
          }}
        >
          <MaterialCommunityIcons
            name="refresh"
            size={15}
            color="#FFFFFF"
          />
          <Text className="text-[12px] font-bold text-white">Tạo lại</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// One term on the timeline
// ═══════════════════════════════════════════════════════════════════════════

function TermNode({
  semester,
  isLast,
  isDark,
  open,
  onToggle,
  onCoursePress,
}: {
  semester: AiRoadmapSemester;
  isLast: boolean;
  isDark: boolean;
  open: boolean;
  onToggle: () => void;
  onCoursePress: () => void;
}) {
  const credits = semester.courses.reduce((s, c) => s + c.credits, 0);
  const isCurrent = semester.status === "current";
  const isCompleted = semester.status === "completed";

  return (
    <View className="flex-row gap-3">
      {/* The rail: the node is the status mark, the line is the spine. */}
      <View className="items-center" style={{ width: 26 }}>
        <View
          className="items-center justify-center rounded-full"
          style={{
            width: 26,
            height: 26,
            backgroundColor: isCurrent ? ORANGE : "transparent",
            borderWidth: isCurrent ? 0 : 2,
            borderColor: isCompleted
              ? isDark
                ? "#3A332C"
                : "#D8CEC3"
              : isDark
                ? "#302A24"
                : "#EAE1D8",
          }}
        >
          {isCurrent ? (
            <MaterialCommunityIcons name="star" size={13} color="#FFFFFF" />
          ) : isCompleted ? (
            <MaterialCommunityIcons
              name="check"
              size={13}
              color={isDark ? "#7D746C" : "#A79C93"}
            />
          ) : (
            <Text
              className="text-[11px] font-bold tabular-nums"
              style={{ color: isDark ? "#A79C93" : "#8B8178" }}
            >
              {semester.semester}
            </Text>
          )}
        </View>
        {!isLast ? (
          <View
            className="w-[2px] flex-1"
            style={{
              backgroundColor: isDark ? "#302A24" : "#EAE1D8",
              minHeight: 20,
              marginVertical: 4,
            }}
          />
        ) : null}
      </View>

      {/* The card */}
      <View className="flex-1 pb-3">
        <Pressable
          onPress={onToggle}
          accessibilityRole="button"
          accessibilityLabel={`${semester.label} · ${semester.term}`}
          accessibilityState={{ expanded: open }}
          className="rounded-3xl border border-line bg-surface px-4 py-3.5 active:opacity-80 dark:border-line-dark dark:bg-surface-dark"
          style={
            isCurrent
              ? { borderColor: ORANGE, borderWidth: 1.5 }
              : undefined
          }
        >
          <View className="flex-row items-start gap-2">
            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                <Text className="text-[15px] font-bold text-ink dark:text-ink-dark">
                  {semester.label}
                </Text>
                {isCurrent ? (
                  <View
                    className="rounded-full px-2 py-0.5"
                    style={{ backgroundColor: isDark ? "#2E1C0E" : "#FFF1E7" }}
                  >
                    <Text
                      className="text-[10px] font-bold"
                      style={{ color: isDark ? "#FFA371" : ORANGE_DEEP }}
                    >
                      ĐANG HỌC
                    </Text>
                  </View>
                ) : null}
                {semester.status === "planned" ? (
                  <View
                    className="rounded-full px-2 py-0.5"
                    style={{ backgroundColor: isDark ? "#241F1B" : "#F2EDE7" }}
                  >
                    <Text className="text-[10px] font-bold text-ink-muted dark:text-ink-muted-dark">
                      AI GỢI Ý
                    </Text>
                  </View>
                ) : null}
              </View>

              <Text className="mt-1 text-[11px] text-ink-muted dark:text-ink-muted-dark tabular-nums">
                {semester.term} · {semester.courses.length} môn · {credits} tín chỉ
                {semester.status !== "completed"
                  ? ` · GPA ${semester.projected_gpa.toFixed(2)}`
                  : ""}
              </Text>
            </View>

            <MaterialCommunityIcons
              name={open ? "chevron-up" : "chevron-down"}
              size={20}
              color={isDark ? "#A79C93" : "#8B8178"}
            />
          </View>

          {/* The note is always visible — it is the assistant's reasoning. */}
          <Text className="mt-2 text-[12px] leading-[17px] text-ink-muted dark:text-ink-muted-dark">
            {semester.note}
          </Text>
        </Pressable>

        {open ? (
          <View className="mt-2">
            {semester.courses.length === 0 ? (
              <View
                className="rounded-2xl border border-dashed px-4 py-4"
                style={{ borderColor: isDark ? "#302A24" : "#EAE1D8" }}
              >
                <Text className="text-center text-[12px] text-ink-muted dark:text-ink-muted-dark">
                  Kỳ này chưa có môn nào
                </Text>
              </View>
            ) : (
              <View className="gap-2">
                {semester.courses.map((course) => (
                  <CourseRow
                    key={`${semester.semester}-${course.course_code}`}
                    course={course}
                    isDark={isDark}
                    onPress={onCoursePress}
                  />
                ))}
              </View>
            )}
          </View>
        ) : null}
      </View>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// One course inside a term
// ═══════════════════════════════════════════════════════════════════════════

function CourseRow({
  course,
  isDark,
  onPress,
}: {
  course: AiRoadmapCourse;
  isDark: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${course.course_code} ${course.course_name}`}
      className="rounded-2xl border border-line bg-surface px-3.5 py-3 active:opacity-70 dark:border-line-dark dark:bg-surface-dark"
    >
      <View className="flex-row items-start gap-3">
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text
              className="text-[11px] font-bold tabular-nums"
              style={{ color: isDark ? "#FFA371" : ORANGE_DEEP }}
            >
              {course.course_code}
            </Text>
            <View
              className="rounded-full px-2 py-0.5"
              style={{ backgroundColor: isDark ? "#241F1B" : "#F2EDE7" }}
            >
              <Text className="text-[10px] font-semibold text-ink-muted dark:text-ink-muted-dark">
                {CATEGORY_LABEL[course.category] ?? course.category}
              </Text>
            </View>
            <Text className="text-[11px] text-ink-faint dark:text-ink-faint-dark tabular-nums">
              {course.credits} TC
            </Text>
          </View>

          <Text className="mt-1 text-[13px] font-semibold leading-[19px] text-ink dark:text-ink-dark">
            {course.course_name}
          </Text>

          <Text className="mt-1 text-[11px] leading-[16px] text-ink-muted dark:text-ink-muted-dark">
            {course.reason}
          </Text>

          {course.prerequisites.length > 0 ? (
            <View className="mt-1.5 flex-row items-center gap-1.5">
              <MaterialCommunityIcons
                name="link-variant"
                size={12}
                color={isDark ? "#7D746C" : "#A79C93"}
              />
              <Text className="text-[11px] text-ink-faint dark:text-ink-faint-dark">
                Cần trước: {course.prerequisites.join(", ")}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}
