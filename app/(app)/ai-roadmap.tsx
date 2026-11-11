/**
 * FE-S-9 — AI suggested curriculum roadmap.
 *
 * ── Direction ───────────────────────────────────────────────────────────────
 * Style: framed-sheet (app), mapped onto the FPT brand tokens. One warm
 * ground, white cards with a single hairline edge, no shadows at rest, the
 * orange reserved for the data and the one primary action.
 *
 * The screen's one question: "How should the AI lay out my remaining
 * semesters?" — so the vertical timeline IS the screen, and the summary
 * above it is three numbers, not a grid of tiles.
 *
 * ── Design notes ────────────────────────────────────────────────────────────
 * • A vertical rail carries the terms. Past terms are closed and quiet; the
 *   current term is the one open, orange-marked card; future terms are the
 *   assistant's proposal, marked as such.
 * • Each course row states its credits and, when it has one, its
 *   prerequisite codes — the reason the assistant ordered it that way.
 * • "Regenerate" re-runs the plan under a different constraint and the
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
import { router } from "expo-router";

import { goBack } from "@/components/ScreenHeader";
import { useAiRoadmap, useRegenerateAiRoadmap } from "@/lib/queries/ai";
import type { AiRoadmapCourse, AiRoadmapSemester } from "@/types/ai";

const ORANGE = "#F36F21";
const ORANGE_DEEP = "#B5460D";

/**
 * The three plans the assistant can produce. "Regenerate" walks through
 * them, so the button always returns a genuinely different plan rather than
 * the same one with a new caption.
 */
const ROADMAP_PLANS: {
  goal: string;
  maxCreditsPerSemester: number;
  note?: string;
}[] = [
  { goal: "Graduate on time with a balanced workload", maxCreditsPerSemester: 18 },
  { goal: "Maximise GPA while staying on track", maxCreditsPerSemester: 16 },
  { goal: "Prioritise AI and data courses", maxCreditsPerSemester: 20 },
];

export default function AiRoadmapScreen() {
  const isDark = useColorScheme() === "dark";

  const { data: roadmap, isLoading, isError, refetch } = useAiRoadmap();
  const regenerate = useRegenerateAiRoadmap();

  // The term the student is looking at. Starts on the current term, which
  // is the one they actually need to act on.
  const [focusSemester, setFocusSemester] = useState<number | null>(null);
  const [planIndex, setPlanIndex] = useState(0);

  const currentSemester = useMemo(() => {
    const current = roadmap?.semesters.find((s) => s.status === "IN_PROGRESS");
    return current?.semesterNumber ?? 1;
  }, [roadmap]);

  const onRegenerate = useCallback(() => {
    if (regenerate.isPending) return;
    const next = (planIndex + 1) % ROADMAP_PLANS.length;
    setPlanIndex(next);
    regenerate.mutate(ROADMAP_PLANS[next]);
  }, [planIndex, regenerate]);

  if (isLoading) {
    return (
      <SafeAreaView
        className="flex-1 bg-ground dark:bg-ground-dark"
        edges={["top"]}
      >
        <RoadmapHeader
          isDark={isDark}
          isRegenerating={false}
          onRegenerate={onRegenerate}
        />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={ORANGE} />
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !roadmap) {
    return (
      <SafeAreaView
        className="flex-1 bg-ground dark:bg-ground-dark"
        edges={["top"]}
      >
        <RoadmapHeader
          isDark={isDark}
          isRegenerating={false}
          onRegenerate={onRegenerate}
        />
        <View className="flex-1 items-center justify-center px-8">
          <MaterialCommunityIcons
            name="cloud-off-outline"
            size={40}
            color="#CBD5E1"
          />
          <Text className="mt-3 text-center text-sm text-ink-muted dark:text-ink-muted-dark">
            Could not load the roadmap. Pull down to try again.
          </Text>
          <Pressable
            onPress={() => refetch()}
            className="mt-4 rounded-full px-6 py-3 active:opacity-80"
            style={{ backgroundColor: ORANGE }}
          >
            <Text className="text-sm font-bold text-white">Try again</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const remaining = roadmap.semesters.filter(
    (s) => s.status !== "COMPLETED",
  );
  const remainingCredits = remaining.reduce(
    (s, sem) => s + sem.courses.reduce((a, c) => a + c.credits, 0),
    0,
  );
  const completedCredits = remaining.reduce(
    (s, sem) =>
      s +
      sem.courses
        .filter((c) => c.status === "COMPLETED" || c.status === "PASSED")
        .reduce((a, c) => a + c.credits, 0),
    0,
  );
  const progress =
    roadmap.totalCredits === 0
      ? 0
      : Math.round((completedCredits / roadmap.totalCredits) * 100);

  return (
    <SafeAreaView className="flex-1 bg-ground dark:bg-ground-dark" edges={["top"]}>
      <RoadmapHeader
        isDark={isDark}
        isRegenerating={regenerate.isPending}
        onRegenerate={onRegenerate}
        subtitle={`${remaining.length} semesters left · ${roadmap.totalCredits} credits`}
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
                Remaining
              </Text>
              <Text className="mt-1 text-xl font-bold text-ink tabular-nums dark:text-ink-dark">
                {remainingCredits}
                <Text className="text-[11px] font-medium text-ink-faint dark:text-ink-faint-dark">
                  {" "}
                  cr
                </Text>
              </Text>
            </View>
            <View className="w-px bg-line dark:bg-line-dark" />
            <View className="flex-1 items-center px-2 py-4">
              <Text className="text-[11px] font-medium text-ink-muted dark:text-ink-muted-dark">
                Semesters
              </Text>
              <Text className="mt-1 text-xl font-bold text-ink tabular-nums dark:text-ink-dark">
                {roadmap.totalSemesters}
              </Text>
            </View>
            <View className="w-px bg-line dark:bg-line-dark" />
            <View className="flex-1 items-center px-2 py-4">
              <Text className="text-[11px] font-medium text-ink-muted dark:text-ink-muted-dark">
                Completed
              </Text>
              <Text className="mt-1 text-xl font-bold text-ink tabular-nums dark:text-ink-dark">
                {completedCredits}
                <Text className="text-[11px] font-medium text-ink-faint dark:text-ink-faint-dark">
                  /{roadmap.totalCredits}
                </Text>
              </Text>
            </View>
          </View>
        </View>

        {/* ── The strategy line — what the assistant optimised for ──── */}
        {roadmap.summary ? (
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
                  {"The AI's strategy"}
                </Text>
                <Text className="mt-0.5 text-[12px] leading-[17px] text-ink-muted dark:text-ink-muted-dark">
                  {roadmap.summary}
                </Text>
              </View>
            </View>
          </View>
        ) : null}

        {/* ── Progress to graduation ─────────────────────────────────── */}
        <View className="px-5 pt-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-[12px] font-semibold text-ink-muted dark:text-ink-muted-dark">
              Programme progress
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
            Semester-by-semester plan
          </Text>
          <Text className="mt-0.5 text-[12px] text-ink-muted dark:text-ink-muted-dark">
            {roadmap.semesters.length} semesters · tap one to see its courses
          </Text>

          <View className="mt-4">
            {roadmap.semesters.map((semester, index) => (
              <TermNode
                key={semester.semesterNumber}
                semester={semester}
                isLast={index === roadmap.semesters.length - 1}
                isDark={isDark}
                open={
                  focusSemester === semester.semesterNumber ||
                  (focusSemester === null &&
                    semester.semesterNumber === currentSemester)
                }
                onToggle={() =>
                  setFocusSemester((prev) =>
                    prev === semester.semesterNumber
                      ? null
                      : semester.semesterNumber,
                  )
                }
                onCoursePress={() => router.push("/(app)/(tabs)/courses")}
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
                The AI is recalculating…
              </Text>
              <Text className="mt-1 text-center text-[11px] text-ink-muted dark:text-ink-muted-dark">
                Optimising the course order under the new constraint
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
          accessibilityLabel="Go back"
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
            AI study roadmap
          </Text>
          <Text className="text-[11px] text-ink-muted dark:text-ink-muted-dark">
            {subtitle ?? "The AI's proposal for your remaining semesters"}
          </Text>
        </View>

        {/* The one primary action on this screen. */}
        <Pressable
          onPress={onRegenerate}
          disabled={isRegenerating}
          accessibilityRole="button"
          accessibilityLabel="Regenerate the roadmap"
          className="flex-row items-center gap-1.5 rounded-full px-3.5 py-2.5 active:opacity-80"
          style={{
            backgroundColor: ORANGE,
            opacity: isRegenerating ? 0.7 : 1,
          }}
        >
          <MaterialCommunityIcons name="refresh" size={15} color="#FFFFFF" />
          <Text className="text-[12px] font-bold text-white">Regenerate</Text>
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
  const isCurrent = semester.status === "IN_PROGRESS";
  const isCompleted = semester.status === "COMPLETED";

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
              {semester.semesterNumber}
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
          accessibilityLabel={`${semester.title} · ${semester.semesterCode}`}
          accessibilityState={{ expanded: open }}
          className="rounded-3xl border border-line bg-surface px-4 py-3.5 active:opacity-80 dark:border-line-dark dark:bg-surface-dark"
          style={isCurrent ? { borderColor: ORANGE, borderWidth: 1.5 } : undefined}
        >
          <View className="flex-row items-start gap-2">
            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                <Text className="text-[15px] font-bold text-ink dark:text-ink-dark">
                  {semester.title}
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
                      CURRENT
                    </Text>
                  </View>
                ) : null}
                {semester.status === "PLANNED" ? (
                  <View
                    className="rounded-full px-2 py-0.5"
                    style={{ backgroundColor: isDark ? "#241F1B" : "#F2EDE7" }}
                  >
                    <Text className="text-[10px] font-bold text-ink-muted dark:text-ink-muted-dark">
                      AI PROPOSAL
                    </Text>
                  </View>
                ) : null}
              </View>

              <Text className="mt-1 text-[11px] text-ink-muted dark:text-ink-muted-dark tabular-nums">
                {semester.semesterCode} · {semester.courses.length} courses ·{" "}
                {credits} credits
              </Text>
            </View>

            <MaterialCommunityIcons
              name={open ? "chevron-up" : "chevron-down"}
              size={20}
              color={isDark ? "#A79C93" : "#8B8178"}
            />
          </View>

          {/* The note is always visible — it is the assistant's reasoning. */}
          {semester.note ? (
            <Text className="mt-2 text-[12px] leading-[17px] text-ink-muted dark:text-ink-muted-dark">
              {semester.note}
            </Text>
          ) : null}
        </Pressable>

        {open ? (
          <View className="mt-2">
            {semester.courses.length === 0 ? (
              <View
                className="rounded-2xl border border-dashed px-4 py-4"
                style={{ borderColor: isDark ? "#302A24" : "#EAE1D8" }}
              >
                <Text className="text-center text-[12px] text-ink-muted dark:text-ink-muted-dark">
                  No courses in this semester
                </Text>
              </View>
            ) : (
              <View className="gap-2">
                {semester.courses.map((course) => (
                  <CourseRow
                    key={`${semester.semesterNumber}-${course.courseId}`}
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
      accessibilityLabel={`${course.courseCode} ${course.courseName}`}
      className="rounded-2xl border border-line bg-surface px-3.5 py-3 active:opacity-70 dark:border-line-dark dark:bg-surface-dark"
    >
      <View className="flex-row items-start gap-3">
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text
              className="text-[11px] font-bold tabular-nums"
              style={{ color: isDark ? "#FFA371" : ORANGE_DEEP }}
            >
              {course.courseCode}
            </Text>
            {course.categoryName ? (
              <View
                className="rounded-full px-2 py-0.5"
                style={{ backgroundColor: isDark ? "#241F1B" : "#F2EDE7" }}
              >
                <Text className="text-[10px] font-semibold text-ink-muted dark:text-ink-muted-dark">
                  {course.categoryName}
                </Text>
              </View>
            ) : null}
            <Text className="text-[11px] text-ink-faint dark:text-ink-faint-dark tabular-nums">
              {course.credits} cr
            </Text>
          </View>

          <Text className="mt-1 text-[13px] font-semibold leading-[19px] text-ink dark:text-ink-dark">
            {course.courseName}
          </Text>

          {course.reason ? (
            <Text className="mt-1 text-[11px] leading-[16px] text-ink-muted dark:text-ink-muted-dark">
              {course.reason}
            </Text>
          ) : null}

          {course.prerequisites.length > 0 ? (
            <View className="mt-1.5 flex-row items-center gap-1.5">
              <MaterialCommunityIcons
                name="link-variant"
                size={12}
                color={isDark ? "#7D746C" : "#A79C93"}
              />
              <Text className="text-[11px] text-ink-faint dark:text-ink-faint-dark">
                Requires: {course.prerequisites.join(", ")}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}
