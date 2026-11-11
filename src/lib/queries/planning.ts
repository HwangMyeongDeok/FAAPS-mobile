/**
 * React Query hooks for the student's study plans.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getSemesters,
  getStudyPlans,
  saveStudyPlan,
  submitStudyPlan,
  validateStudyPlan,
} from "@/lib/api/planning";

export const planningKeys = {
  all: ["planning"] as const,
  plans: () => ["planning", "plans"] as const,
  semesters: () => ["planning", "semesters"] as const,
  issues: (planId: string) => ["planning", "issues", planId] as const,
};

export function useStudyPlans() {
  return useQuery({
    queryKey: planningKeys.plans(),
    queryFn: getStudyPlans,
    staleTime: 5 * 60_000,
  });
}

export function usePlanSemesters() {
  return useQuery({
    queryKey: planningKeys.semesters(),
    queryFn: getSemesters,
    staleTime: 30 * 60_000,
  });
}

export function usePlanIssues(planId: string | null) {
  return useQuery({
    queryKey: planId ? planningKeys.issues(planId) : ["planning", "issues", "none"],
    queryFn: () => validateStudyPlan(planId!),
    enabled: !!planId,
    staleTime: 60_000,
  });
}

export function useSaveStudyPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      semesterId: string;
      planType?: string;
      courseIds: string[];
    }) => saveStudyPlan(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: planningKeys.all });
    },
  });
}

export function useSubmitStudyPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (planId: string) => submitStudyPlan(planId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: planningKeys.all });
    },
  });
}
