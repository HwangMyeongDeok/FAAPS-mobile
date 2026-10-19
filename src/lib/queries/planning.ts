/**
 * React Query hooks for study-plan data.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getStudyPlan,
  regenerateStudyPlan,
  savePlanDraft,
  publishPlan,
  type StudyPlan,
} from "@/lib/api/planning";
import type { GeneratePlanInput } from "@/modules/planning/schemas/planning.schema";
import { useAuthStore } from "@/stores/auth";

export const planningKeys = {
  all: ["planning"] as const,
  plan: (studentId: string) => ["planning", "plan", studentId] as const,
};

export function useStudyPlan() {
  const studentId = useAuthStore((s) => s.session?.user.id ?? null);
  return useQuery({
    queryKey: studentId ? planningKeys.plan(studentId) : ["planning", "plan", "none"],
    queryFn: () => getStudyPlan(studentId!),
    enabled: !!studentId,
    staleTime: 5 * 60_000,
  });
}

export function useRegeneratePlan() {
  const studentId = useAuthStore((s) => s.session?.user.id ?? null);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: GeneratePlanInput) => regenerateStudyPlan(studentId!, input),
    onSuccess: (data) => {
      if (data && studentId) {
        qc.setQueryData(planningKeys.plan(studentId), data);
      }
    },
  });
}

export function useSavePlanDraft() {
  const studentId = useAuthStore((s) => s.session?.user.id ?? null);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (plan: StudyPlan) => savePlanDraft(studentId!, plan),
    onSuccess: (data) => {
      if (data && studentId) qc.setQueryData(planningKeys.plan(studentId), data);
    },
  });
}

export function usePublishPlan() {
  const studentId = useAuthStore((s) => s.session?.user.id ?? null);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (planId: string) => publishPlan(studentId!, planId),
    onSuccess: (data) => {
      if (data && studentId) qc.setQueryData(planningKeys.plan(studentId), data);
    },
  });
}