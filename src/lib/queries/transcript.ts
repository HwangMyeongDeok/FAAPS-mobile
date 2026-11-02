/**
 * React Query hooks for transcript data (FE-S-3).
 * Every screen goes through these hooks — never call API fns
 * directly inside a component, so refetch & caching stay central.
 */
import { useQuery } from "@tanstack/react-query";

import { getTranscript } from "@/lib/api/transcript";
import { useAuthStore } from "@/stores/auth";

export const transcriptKeys = {
  all: ["transcript"] as const,
  one: (studentId: string) => ["transcript", studentId] as const,
};

export function useTranscript() {
  const studentId = useAuthStore((s) => s.session?.user.id ?? null);
  return useQuery({
    queryKey: studentId ? transcriptKeys.one(studentId) : ["transcript", "none"],
    queryFn: () => getTranscript(studentId!),
    enabled: !!studentId,
    staleTime: 5 * 60_000,
  });
}
