/**
 * React Query hooks for the AI Assistant.
 *
 * The roadmap goes through the query cache — regenerating replaces the
 * cached plan. The chat thread is different: the screen owns the live list
 * (it has to append the student's own message the instant they hit send,
 * before any answer exists), so these hooks only expose the mutations.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getAiRoadmap,
  getAiThread,
  getPromptSuggestions,
  rateAiMessage,
  regenerateAiRoadmap,
  sendAiMessage,
} from "@/lib/api/ai";
import type { AiRoadmapRequest } from "@/types/ai";

export const aiKeys = {
  all: ["ai"] as const,
  thread: (studentId: string) => ["ai", "thread", studentId] as const,
  prompts: () => ["ai", "prompts"] as const,
  roadmap: (studentId: string) => ["ai", "roadmap", studentId] as const,
  /**
   * The request the cached roadmap was built from. The screen needs it so
   * "Tạo lại lộ trình" knows which plan it is currently showing, even after
   * the student leaves the screen and comes back.
   */
  roadmapRequest: (studentId: string) => ["ai", "roadmap", "request", studentId] as const,
};

export function useAiThread(studentId: string | null) {
  return useQuery({
    queryKey: studentId ? aiKeys.thread(studentId) : ["ai", "thread", "none"],
    queryFn: () => getAiThread(studentId!),
    enabled: !!studentId,
    staleTime: 60_000,
  });
}

export function useAiPrompts() {
  return useQuery({
    queryKey: aiKeys.prompts(),
    queryFn: getPromptSuggestions,
    staleTime: 30 * 60_000,
  });
}

/**
 * Send a question. The screen appends the student's message itself, then
 * appends the answer when this resolves.
 */
export function useSendAiMessage(studentId: string | null) {
  return useMutation({
    mutationFn: (question: string) => sendAiMessage(studentId!, question),
  });
}

/** Record the verdict on one answer. */
export function useRateAiMessage(studentId: string | null) {
  return useMutation({
    mutationFn: ({ messageId, rating }: { messageId: string; rating: "up" | "down" }) =>
      rateAiMessage(studentId!, messageId, rating),
  });
}

export function useAiRoadmap(studentId: string | null) {
  return useQuery({
    queryKey: studentId ? aiKeys.roadmap(studentId) : ["ai", "roadmap", "none"],
    queryFn: () => getAiRoadmap(studentId!),
    enabled: !!studentId,
    staleTime: 5 * 60_000,
  });
}

export function useRegenerateAiRoadmap(studentId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (request: AiRoadmapRequest) => regenerateAiRoadmap(studentId!, request),
    onSuccess: (data, request) => {
      if (!studentId) return;
      qc.setQueryData(aiKeys.roadmap(studentId), data);
      qc.setQueryData(aiKeys.roadmapRequest(studentId), request);
    },
  });
}
