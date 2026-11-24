/**
 * React Query hooks for the student's course learning plans.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createCourseLearningPlan,
  getCourseLearningPlan,
  getCourseLearningPlans,
  toggleCourseLearningTask,
} from "@/lib/api/course-learning-plan";
import type {
  CourseLearningPlan,
  CreateCourseLearningPlanInput,
} from "@/types/course-learning-plan";

export const coursePlanKeys = {
  all: ["course-learning-plans"] as const,
  list: () => ["course-learning-plans", "list"] as const,
  detail: (planId: string) => ["course-learning-plans", "detail", planId] as const,
};

/** Every course learning plan of the student. */
export function useCourseLearningPlans() {
  return useQuery({
    queryKey: coursePlanKeys.list(),
    queryFn: getCourseLearningPlans,
    staleTime: 5 * 60_000,
  });
}

/** One plan with its tasks — used by the detail sheet. */
export function useCourseLearningPlan(planId: string | null) {
  return useQuery({
    queryKey: coursePlanKeys.detail(planId ?? ""),
    queryFn: () => getCourseLearningPlan(planId!),
    enabled: !!planId,
    staleTime: 60_000,
  });
}

/** Creates a plan; refreshes the list so the new card shows up. */
export function useCreateCourseLearningPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCourseLearningPlanInput) => createCourseLearningPlan(input),
    onSuccess: (plan: CourseLearningPlan) => {
      qc.invalidateQueries({ queryKey: coursePlanKeys.all });
      qc.setQueryData(coursePlanKeys.detail(plan.header.id), plan);
    },
  });
}

/**
 * Ticks a task off (or back on).
 *
 * The endpoint returns the whole updated plan, so both the detail cache and
 * the list cache (which carries the progress bars) are refreshed from the
 * server response — no optimistic guess, no second round trip.
 */
export function useToggleCourseLearningTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: {
      planId: string;
      taskId: string;
      completed: boolean;
    }) => toggleCourseLearningTask(vars.planId, vars.taskId, { completed: vars.completed }),
    onSuccess: (plan: CourseLearningPlan) => {
      qc.setQueryData(coursePlanKeys.detail(plan.header.id), plan);
      qc.invalidateQueries({ queryKey: coursePlanKeys.list() });
    },
  });
}
