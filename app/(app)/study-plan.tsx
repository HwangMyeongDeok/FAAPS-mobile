/**
 * FE-S — Study plan.
 *
 * Container keeps all data logic (React Query + selection state).
 * Every visual block lives in `src/modules/planning/components/`.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshControl, ScrollView, Text, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { ScreenHeader, goBack } from "@/components/ScreenHeader";
import { Sheet } from "@/components/ui";
import { ErrorBlock } from "@/components/feedback";
import { useMyAdvisor } from "@/lib/queries/profile";
import { usePlanSemesters, useSaveStudyPlan, useStudyPlans, useSubmitStudyPlan } from "@/lib/queries/planning";
import { useCurriculumCourses } from "@/modules/curriculum/hooks/useGroupedCourses";
import type { CurriculumPlan, PlanSemester } from "@/types";
import { ORANGE, ORANGE_DEEP } from "@/modules/planning/format";
import { PlanSummary } from "@/modules/planning/components/PlanSummary";
import { TermCard } from "@/modules/planning/components/TermCard";
import { EditorSheet } from "@/modules/planning/components/EditorSheet";
import { PlanSkeleton } from "@/modules/planning/components/PlanSkeleton";

export default function StudyPlanScreen() {
  const isDark = useColorScheme() === "dark";

  const { data: plans = [], isLoading, isError, refetch, isRefetching } = useStudyPlans();
  const { data: semesters = [] } = usePlanSemesters();
  const { data: advisor } = useMyAdvisor();
  const { data: curriculumCourses = [] } = useCurriculumCourses();

  const savePlan = useSaveStudyPlan();
  const submitPlan = useSubmitStudyPlan();

  const [editTarget, setEditTarget] = useState<PlanSemester | null>(null);
  const [sheetQuery, setSheetQuery] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const planBySemester = useMemo(() => {
    const m = new Map<string, CurriculumPlan>();
    for (const p of plans) {
      const key = p.header.semesterId;
      const existing = m.get(key);
      if (!existing || p.header.version > existing.header.version) m.set(key, p);
    }
    return m;
  }, [plans]);

  const orderedSemesters = useMemo(() => {
    const withPlan = semesters.filter((s) => planBySemester.has(s.id));
    const without = semesters.filter((s) => !planBySemester.has(s.id));
    return [...withPlan, ...without];
  }, [semesters, planBySemester]);

  const totals = useMemo(() => {
    let credits = 0;
    let courses = 0;
    let awaitingReview = 0;
    for (const p of plans) {
      credits += p.header.totalCredits ?? 0;
      courses += p.courses.length;
      if (["SUBMITTED", "PENDING_REVIEW"].includes(p.header.status?.toUpperCase())) {
        awaitingReview += 1;
      }
    }
    return { credits, courses, awaitingReview };
  }, [plans]);

  const openEditor = useCallback((semester: PlanSemester) => {
    setEditTarget(semester);
    setSheetQuery("");
  }, []);

  const handleSubmit = useCallback(
    (plan: CurriculumPlan) => {
      if (submitPlan.isPending) return;
      submitPlan.mutate(plan.header.id, {
        onSuccess: () => setToast("Plan sent to your advisor for review"),
        onError: () => setToast("Could not send the plan. Please try again."),
      });
    },
    [submitPlan],
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-ground dark:bg-ground-dark" edges={["top"]}>
        <ScreenHeader title="Study plan" subtitle="Your terms and courses" onBack={goBack} />
        <PlanSkeleton />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1 bg-ground dark:bg-ground-dark" edges={["top"]}>
        <ScreenHeader title="Study plan" subtitle="Your terms and courses" onBack={goBack} />
        <View className="flex-1 px-5 pt-6">
          <ErrorBlock
            title="Could not load your study plan"
            message="Check your connection and try again."
            onRetry={() => refetch()}
          />
        </View>
      </SafeAreaView>
    );
  }

  const advisorName = advisor?.fullName ?? "Your advisor";

  return (
    <SafeAreaView className="flex-1 bg-ground dark:bg-ground-dark" edges={["top"]}>
      <ScreenHeader
        title="Study plan"
        subtitle={`${totals.courses} courses · ${totals.credits} credits planned`}
        onBack={goBack}
        right={
          totals.awaitingReview > 0 ? (
            <View className="rounded-full px-3 py-1.5" style={{ backgroundColor: "#FFF1E7" }}>
              <Text className="text-[11px] font-bold" style={{ color: ORANGE_DEEP }}>
                {totals.awaitingReview} in review
              </Text>
            </View>
          ) : undefined
        }
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => {
              refetch();
            }}
            tintColor={ORANGE}
          />
        }
      >
        <PlanSummary
          terms={semesters.length}
          credits={totals.credits}
          awaitingReview={totals.awaitingReview}
        />

        <View className="px-5 pt-6">
          <Text className="text-[15px] font-bold text-ink dark:text-ink-dark">Your terms</Text>
          <Text className="mt-0.5 text-[12px] text-ink-muted dark:text-ink-muted-dark">
            Tap a term to plan its courses
          </Text>

          {orderedSemesters.length === 0 ? (
            <View
              className="mt-4 items-center rounded-3xl border border-dashed px-6 py-10"
              style={{ borderColor: isDark ? "#302A24" : "#EAE1D8" }}
            >
              <MaterialCommunityIcons name="calendar-blank-outline" size={38} color="#CBD5E1" />
              <Text className="mt-3 text-center text-[13px] text-ink-muted dark:text-ink-muted-dark">
                No semesters have been published yet. Check back once the registrar opens term
                registration.
              </Text>
            </View>
          ) : (
            <View className="mt-3 gap-3">
              {orderedSemesters.map((semester) => (
                <TermCard
                  key={semester.id}
                  semester={semester}
                  plan={planBySemester.get(semester.id) ?? null}
                  isDark={isDark}
                  advisorName={advisorName}
                  busy={submitPlan.isPending}
                  onEdit={() => openEditor(semester)}
                  onSubmit={() => {
                    const plan = planBySemester.get(semester.id);
                    if (plan) handleSubmit(plan);
                  }}
                />
              ))}
            </View>
          )}
        </View>

        <Text className="mt-6 px-5 text-center text-[11px] leading-4 text-ink-faint dark:text-ink-faint-dark">
          Keep each term to 14–18 credits so you stay on track for graduation.
        </Text>
      </ScrollView>

      {toast ? (
        <View className="absolute left-5 right-5 top-2 items-center" pointerEvents="none">
          <View
            className="rounded-full px-4 py-2.5"
            style={{ backgroundColor: isDark ? "#1B1815" : "#191512" }}
          >
            <Text className="text-xs font-semibold text-white">{toast}</Text>
          </View>
        </View>
      ) : null}

      <Sheet open={!!editTarget} onClose={() => setEditTarget(null)} maxHeightRatio={0.9}>
        {editTarget ? (
          <EditorSheet
            semester={editTarget}
            plan={planBySemester.get(editTarget.id) ?? null}
            curriculum={curriculumCourses}
            query={sheetQuery}
            onQuery={setSheetQuery}
            isDark={isDark}
            saving={savePlan.isPending}
            onClose={() => setEditTarget(null)}
            onSave={(courseIds) => {
              savePlan.mutate(
                { semesterId: editTarget.id, planType: "REGULAR", courseIds },
                {
                  onSuccess: () => {
                    setEditTarget(null);
                    setToast("Draft saved");
                  },
                  onError: () => setToast("Could not save the draft. Please try again."),
                },
              );
            }}
          />
        ) : null}
      </Sheet>

      {!editTarget && submitPlan.isPending ? (
        <View className="absolute bottom-6 left-5 right-5 items-center" pointerEvents="none">
          <View
            className="flex-row items-center gap-2 rounded-full px-4 py-2.5"
            style={{ backgroundColor: isDark ? "#1B1815" : "#191512" }}
          >
            <Text className="text-xs font-semibold text-white">Sending for review…</Text>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}
