/**
 * FE-S-9 — AI suggested curriculum roadmap.
 * Container keeps data hooks; visuals live in `src/modules/ai/components/`.
 */

import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";

import { ErrorBlock, EmptyBlock, LoadingBlock } from "@/components/feedback";
import { useAiRoadmap, useRegenerateAiRoadmap } from "@/lib/queries/ai";
import { ORANGE, ORANGE_DEEP } from "@/modules/ai/format";
import { RoadmapHeader } from "@/modules/ai/components/RoadmapHeader";
import { TermNode } from "@/modules/ai/components/TermNode";

const ROADMAP_PLANS: { goal: string; maxCreditsPerSemester: number; note?: string }[] = [
  { goal: "Graduate on time with a balanced workload", maxCreditsPerSemester: 18 },
  { goal: "Maximise GPA while staying on track", maxCreditsPerSemester: 16 },
  { goal: "Prioritise AI and data courses", maxCreditsPerSemester: 20 },
];

export default function AiRoadmapScreen() {
  const isDark = useColorScheme() === "dark";
  const { data: roadmap, isLoading, isError, refetch } = useAiRoadmap();
  const regenerate = useRegenerateAiRoadmap();

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
      <SafeAreaView className="flex-1 bg-ground dark:bg-ground-dark" edges={["top"]}>
        <RoadmapHeader isDark={isDark} isRegenerating={false} onRegenerate={onRegenerate} />
        <View className="flex-1 px-5 pt-4">
          <LoadingBlock message="The AI is laying out your semesters…" />
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1 bg-ground dark:bg-ground-dark" edges={["top"]}>
        <RoadmapHeader isDark={isDark} isRegenerating={false} onRegenerate={onRegenerate} />
        <View className="flex-1 px-5 pt-4">
          <ErrorBlock
            title="Could not load the roadmap"
            message="Check your connection and try again."
            onRetry={() => refetch()}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (!roadmap) {
    return (
      <SafeAreaView className="flex-1 bg-ground dark:bg-ground-dark" edges={["top"]}>
        <RoadmapHeader
          isDark={isDark}
          isRegenerating={regenerate.isPending}
          onRegenerate={onRegenerate}
        />
        <View className="flex-1 px-5 pt-4">
          <EmptyBlock
            icon="robot-outline"
            title="No roadmap yet"
            message="Let the assistant lay out your remaining semesters based on your progress so far."
            actionLabel={regenerate.isPending ? "Generating…" : "Generate my roadmap"}
            onAction={onRegenerate}
          />
        </View>
      </SafeAreaView>
    );
  }

  const remaining = roadmap.semesters.filter((s) => s.status !== "COMPLETED");
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
                  (focusSemester === null && semester.semesterNumber === currentSemester)
                }
                onToggle={() =>
                  setFocusSemester((prev) =>
                    prev === semester.semesterNumber ? null : semester.semesterNumber,
                  )
                }
                onCoursePress={() => router.push("/(app)/(tabs)/courses")}
              />
            ))}
          </View>
        </View>

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
