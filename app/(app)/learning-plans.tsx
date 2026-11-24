/**
 * FE-S — Course learning plans.
 *
 * "Kế hoạch học tập từng môn": the list of the student's per-course
 * learning plans (goal + tasks + progress). Tapping a plan opens its
 * detail sheet; the "+" button opens the create sheet.
 *
 * Container keeps all data logic (React Query + selection state);
 * every visual block lives in `src/modules/learning-plans/components/`.
 */
import { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, RefreshControl, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { ScreenHeader, goBack } from "@/components/ScreenHeader";
import { EmptyBlock, ErrorBlock } from "@/components/feedback";
import { useCourseLearningPlans } from "@/lib/queries/course-learning-plan";
import { CreatePlanSheet, PlanCard, PlanDetailSheet } from "@/modules/learning-plans";
import { ORANGE } from "@/modules/learning-plans/format";

export default function LearningPlansScreen() {
  const { data: plans = [], isLoading, isError, refetch, isRefetching } =
    useCourseLearningPlans();

  const [creating, setCreating] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const openPlan = useCallback((planId: string) => setSelectedPlanId(planId), []);

  const totals = useMemo(() => {
    let courses = 0;
    let tasks = 0;
    let done = 0;
    for (const plan of plans) {
      courses += 1;
      tasks += plan.tasks.length;
      done += plan.tasks.filter((t) => t.completed).length;
    }
    const percent = tasks === 0 ? 0 : Math.round((done / tasks) * 100);
    return { courses, tasks, done, percent };
  }, [plans]);

  const subtitle =
    plans.length === 0
      ? "Your personal plan for each course"
      : `${totals.courses} course${totals.courses === 1 ? "" : "s"} · ${totals.done}/${totals.tasks} tasks done`;

  return (
    <SafeAreaView className="flex-1 bg-ground dark:bg-ground-dark" edges={["top"]}>
      <ScreenHeader
        title="Learning plans"
        subtitle={subtitle}
        onBack={goBack}
        right={
          <Pressable
            onPress={() => setCreating(true)}
            accessibilityRole="button"
            accessibilityLabel="Create a learning plan"
            hitSlop={10}
            className="h-10 w-10 items-center justify-center rounded-full active:opacity-80"
            style={{ backgroundColor: ORANGE }}
          >
            <MaterialCommunityIcons name="plus" size={22} color="#FFFFFF" />
          </Pressable>
        }
      />

      {isError ? (
        <View className="flex-1 px-5 pt-6">
          <ErrorBlock
            title="Could not load your learning plans"
            message="Check your connection and try again."
            onRetry={() => refetch()}
          />
        </View>
      ) : (
        <FlatList
          data={plans}
          keyExtractor={(item) => item.header.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}
          ItemSeparatorComponent={() => <View className="h-3" />}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => {
                refetch();
              }}
              tintColor={ORANGE}
            />
          }
          ListEmptyComponent={
            isLoading ? undefined : (
              <EmptyBlock
                icon="clipboard-text-clock-outline"
                title="No learning plan yet"
                message="Create a plan for a course to break it into small learning tasks."
                actionLabel="Create a plan"
                onAction={() => setCreating(true)}
              />
            )
          }
          renderItem={({ item }) => (
            <PlanCard plan={item} onPress={() => openPlan(item.header.id)} />
          )}
        />
      )}

      {isLoading ? (
        <View className="absolute inset-0 items-center justify-center">
          <MaterialCommunityIcons name="loading" size={30} color={ORANGE} />
        </View>
      ) : null}

      {/* Detail */}
      <PlanDetailSheet planId={selectedPlanId} onClose={() => setSelectedPlanId(null)} />

      {/* Create */}
      <CreatePlanSheet
        open={creating}
        onClose={() => setCreating(false)}
        onCreated={(planId) => setSelectedPlanId(planId)}
      />
    </SafeAreaView>
  );
}
