/**
 * React Query hooks for the AI assistant (chat thread + roadmap).
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createAiConversation,
  getAiConversations,
  getAiMessages,
  getAiRoadmap,
  rateAiMessage,
  regenerateAiRoadmap,
  sendAiMessage,
} from "@/lib/api/ai";

export const aiKeys = {
  all: ["ai"] as const,
  conversations: () => ["ai", "conversations"] as const,
  messages: (conversationId: string) =>
    ["ai", "conversations", conversationId, "messages"] as const,
  roadmap: () => ["ai", "roadmap"] as const,
};

export function useAiConversations() {
  return useQuery({
    queryKey: aiKeys.conversations(),
    queryFn: getAiConversations,
    staleTime: 60_000,
  });
}

export function useAiMessages(conversationId: string | null) {
  return useQuery({
    queryKey: conversationId
      ? aiKeys.messages(conversationId)
      : ["ai", "messages", "none"],
    queryFn: () => getAiMessages(conversationId!),
    enabled: !!conversationId,
    staleTime: 30_000,
  });
}

export function useCreateAiConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (title?: string) => createAiConversation(title),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: aiKeys.conversations() });
    },
  });
}

export function useSendAiMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      conversationId,
      content,
    }: {
      conversationId: string;
      content: string;
    }) => sendAiMessage(conversationId, content),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: aiKeys.messages(variables.conversationId) });
      qc.invalidateQueries({ queryKey: aiKeys.conversations() });
    },
  });
}

export function useRateAiMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      messageId,
      wasHelpful,
      feedback,
    }: {
      messageId: string;
      wasHelpful: boolean;
      feedback?: string;
    }) => rateAiMessage(messageId, wasHelpful, feedback),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: aiKeys.all });
    },
  });
}

export function useAiRoadmap() {
  return useQuery({
    queryKey: aiKeys.roadmap(),
    queryFn: getAiRoadmap,
    staleTime: 5 * 60_000,
  });
}

export function useRegenerateAiRoadmap() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: regenerateAiRoadmap,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: aiKeys.roadmap() });
    },
  });
}
