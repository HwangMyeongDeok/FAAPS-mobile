/**
 * React Query hooks for advisor data + conversations.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getAdvisors,
  getConversations,
  getMessages,
  sendMessage,
  markConversationRead,
} from "@/lib/api/advisor";
import { useAuthStore } from "@/stores/auth";

export const advisorKeys = {
  all: ["advisor"] as const,
  list: () => ["advisor", "list"] as const,
  conversations: (studentId: string) => ["advisor", "conversations", studentId] as const,
  messages: (convId: string) => ["advisor", "messages", convId] as const,
};

export function useAdvisors() {
  return useQuery({
    queryKey: advisorKeys.list(),
    queryFn: getAdvisors,
    staleTime: 10 * 60_000,
  });
}

export function useConversations() {
  const studentId = useAuthStore((s) => s.session?.user.id ?? null);
  return useQuery({
    queryKey: studentId ? advisorKeys.conversations(studentId) : ["advisor", "conversations", "none"],
    queryFn: () => getConversations(studentId!),
    enabled: !!studentId,
    staleTime: 60_000,
  });
}

export function useMessages(conversationId: string | null) {
  return useQuery({
    queryKey: conversationId ? advisorKeys.messages(conversationId) : ["advisor", "messages", "none"],
    queryFn: () => getMessages(conversationId!),
    enabled: !!conversationId,
    staleTime: 30_000,
  });
}

export function useSendMessage(conversationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => sendMessage(conversationId, content),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: advisorKeys.messages(conversationId) });
      const studentId = useAuthStore.getState().session?.user.id;
      if (studentId) qc.invalidateQueries({ queryKey: advisorKeys.conversations(studentId) });
    },
  });
}

export function useMarkConversationRead(conversationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => markConversationRead(conversationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: advisorKeys.messages(conversationId) });
      const studentId = useAuthStore.getState().session?.user.id;
      if (studentId) qc.invalidateQueries({ queryKey: advisorKeys.conversations(studentId) });
    },
  });
}