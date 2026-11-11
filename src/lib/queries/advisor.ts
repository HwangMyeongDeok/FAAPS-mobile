/**
 * React Query hooks for the advising requests and their conversations.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  cancelAdvisingRequest,
  createAdvisingRequest,
  getAdvisingRequestDetail,
  getAdvisingRequests,
  sendAdvisingMessage,
} from "@/lib/api/advisor";

export const advisorKeys = {
  all: ["advisor"] as const,
  requests: () => ["advisor", "requests"] as const,
  detail: (requestId: string) => ["advisor", "requests", requestId] as const,
};

export function useAdvisingRequests() {
  return useQuery({
    queryKey: advisorKeys.requests(),
    queryFn: getAdvisingRequests,
    staleTime: 60_000,
  });
}

export function useAdvisingRequestDetail(requestId: string | null) {
  return useQuery({
    queryKey: requestId ? advisorKeys.detail(requestId) : ["advisor", "requests", "none"],
    queryFn: () => getAdvisingRequestDetail(requestId!),
    enabled: !!requestId,
    staleTime: 30_000,
  });
}

export function useSendAdvisingMessage(requestId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => sendAdvisingMessage(requestId, content),
    onSuccess: (data) => {
      qc.setQueryData(advisorKeys.detail(requestId), data);
      qc.invalidateQueries({ queryKey: advisorKeys.requests() });
    },
  });
}

export function useCancelAdvisingRequest(requestId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => cancelAdvisingRequest(requestId),
    onSuccess: (data) => {
      qc.setQueryData(advisorKeys.detail(requestId), data);
      qc.invalidateQueries({ queryKey: advisorKeys.requests() });
    },
  });
}

/**
 * Create a new advising request. The backend assigns it to the student's own
 * advisor, so the request only carries a title and a description.
 */
export function useCreateAdvisingRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { title: string; description: string }) =>
      createAdvisingRequest(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: advisorKeys.requests() });
    },
  });
}
