/**
 * React Query hooks for the transcript and academic progress.
 */
import { useQuery } from "@tanstack/react-query";

import { getProgress, getTranscript } from "@/lib/api/transcript";

export const transcriptKeys = {
  all: ["transcript"] as const,
  rows: () => ["transcript", "rows"] as const,
  progress: () => ["transcript", "progress"] as const,
};

export function useTranscript() {
  return useQuery({
    queryKey: transcriptKeys.rows(),
    queryFn: getTranscript,
    staleTime: 5 * 60_000,
  });
}

export function useProgress() {
  return useQuery({
    queryKey: transcriptKeys.progress(),
    queryFn: getProgress,
    staleTime: 5 * 60_000,
  });
}
