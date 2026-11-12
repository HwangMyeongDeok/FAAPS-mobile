/**
 * FE-S-3 — Transcript & academic progress.
 * Container keeps data logic; visuals live in `src/modules/transcript/`.
 */

import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { ScreenHeader, goBack } from "@/components/ScreenHeader";
import { Skeleton } from "@/components/ui";
import { ErrorBlock, EmptyBlock } from "@/components/feedback";
import { useMyProfile, useMyProgress } from "@/lib/queries/profile";
import { useTranscript } from "@/lib/queries/transcript";
import {
  ORANGE,
  ORANGE_DEEP,
  groupBySemester,
} from "@/modules/transcript/format";
import { WarningBanner } from "@/modules/transcript/components/WarningBanner";
import { TranscriptHero } from "@/modules/transcript/components/TranscriptHero";
import {
  SemesterOverview,
  SemesterCard,
} from "@/modules/transcript/components/SemesterCard";

export default function TranscriptScreen() {
  const isDark = useColorScheme() === "dark";
  const { data: profile } = useMyProfile();
  const { data: progress } = useMyProgress();
  const {
    data: transcript = [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useTranscript();

  const semesters = useMemo(() => groupBySemester(transcript), [transcript]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const stats = useMemo(() => {
    let attempted = 0;
    let earned = 0;
    let courses = 0;
    let failed = 0;
    for (const sem of semesters) {
      for (const c of sem.rows) {
        attempted += c.credits;
        courses += 1;
        if (c.status === "PASSED" || c.status === "EXEMPTED") {
          earned += c.creditsEarned ?? c.credits;
        } else if (c.status === "FAILED") {
          failed += 1;
        }
      }
    }
    return { attempted, earned, courses, failed };
  }, [semesters]);

  const grad = useMemo(() => {
    const earned = progress?.earnedCredits ?? profile?.totalCreditsEarned ?? 0;
    const total = progress?.requiredCredits ?? 0;
    const pct = total === 0 ? 0 : Math.min(100, Math.round((earned / total) * 100));
    return { earned, total, pct, left: Math.max(0, total - earned) };
  }, [progress, profile]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-ground dark:bg-ground-dark" edges={["top"]}>
        <ScreenHeader
          title="Transcript"
          subtitle="Your academic results & graduation progress"
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
        <ScreenHeader
          title="Transcript"
          subtitle="Your academic results & graduation progress"
          onBack={goBack}
        />
        <View className="flex-1 px-5 pt-6">
          <ErrorBlock
            title="Could not load your transcript"
            message="Check your connection and pull down to try again."
            onRetry={() => refetch()}
          />
        </View>
      </SafeAreaView>
    );
  }

  const onProbation = profile?.academicStatus === "PROBATION";
  const failedCourses = semesters
    .flatMap((s) => s.rows.filter((c) => c.status === "FAILED"))
    .map((c) => c.courseCode);
  const cumulativeGpa = progress?.currentGpa ?? profile?.currentGpa ?? null;

  return (
    <SafeAreaView className="flex-1 bg-ground dark:bg-ground-dark" edges={["top"]}>
      <ScreenHeader
        title="Transcript"
        subtitle={`${profile?.studentCode ?? ""} · ${profile?.cohort ?? ""}`}
        onBack={goBack}
        right={
          <View
            className="rounded-full px-3 py-1.5"
            style={{ backgroundColor: isDark ? "#2E1C0E" : "#FFF1E7" }}
          >
            <Text
              className="text-[11px] font-bold"
              style={{ color: isDark ? "#FFA371" : ORANGE_DEEP }}
            >
              {semesters.length} terms · {stats.courses} courses
            </Text>
          </View>
        }
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} tintColor={ORANGE} />
        }
      >
        {onProbation ? <WarningBanner failedCourses={failedCourses} isDark={isDark} /> : null}

        <TranscriptHero
          cumulativeGpa={cumulativeGpa}
          courseCount={stats.courses}
          earned={grad.earned}
          total={grad.total}
        />

        {progress && progress.semesters.length > 0 ? (
          <SemesterOverview semesters={progress.semesters} />
        ) : null}

        <View className="px-5 pt-6">
          <View className="flex-row items-end justify-between">
            <Text className="text-[15px] font-bold text-ink dark:text-ink-dark">
              Results by semester
            </Text>
            {stats.failed > 0 ? (
              <Text className="text-[11px] font-bold" style={{ color: "#DC2626" }}>
                {stats.failed} not passed
              </Text>
            ) : null}
          </View>

          {semesters.length === 0 ? (
            <View className="mt-3">
              <EmptyBlock
                icon="file-document-outline"
                iconColor="#CBD5E1"
                title="No results yet"
                message="Your transcript will appear here once your first semester is graded."
              />
            </View>
          ) : (
            <View className="mt-3 gap-3">
              {semesters.map((sem, index) => (
                <SemesterCard
                  key={sem.key}
                  semester={sem}
                  isDark={isDark}
                  open={expanded[sem.key] ?? index === 0}
                  onToggle={() =>
                    setExpanded((p) => ({ ...p, [sem.key]: !(p[sem.key] ?? index === 0) }))
                  }
                />
              ))}
            </View>
          )}

          <Text className="mt-4 text-center text-[11px] leading-4 text-ink-faint dark:text-ink-faint-dark">
            <MaterialCommunityIcons name="information-outline" size={11} /> Scores are on a
            10-point scale · a course below 5.00 is not passed and must be retaken
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
