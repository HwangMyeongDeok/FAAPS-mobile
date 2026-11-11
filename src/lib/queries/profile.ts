// ============================================================
// React Query hooks for profile data.
// Every screen goes through these hooks — never call API functions
// directly inside a component, so refetch & caching stay central.
// ============================================================

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getMyAdvisor,
  getMyProfile,
  getMyProgress,
  updateMyProfile,
} from "@/lib/api/profile";
import type { UpdateProfileInput } from "@/types";

export const profileKeys = {
  all: ["profile"] as const,
  me: () => ["profile", "me"] as const,
  advisor: () => ["profile", "advisor"] as const,
  progress: () => ["profile", "progress"] as const,
};

export function useMyProfile() {
  return useQuery({
    queryKey: profileKeys.me(),
    queryFn: getMyProfile,
    staleTime: 60_000,
  });
}

export function useMyAdvisor() {
  return useQuery({
    queryKey: profileKeys.advisor(),
    queryFn: getMyAdvisor,
    staleTime: 5 * 60_000,
  });
}

export function useMyProgress() {
  return useQuery({
    queryKey: profileKeys.progress(),
    queryFn: getMyProgress,
    staleTime: 60_000,
  });
}

export function useUpdateMyProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProfileInput) => updateMyProfile(input),
    onSuccess: (data) => {
      qc.setQueryData(profileKeys.me(), data);
      qc.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}
