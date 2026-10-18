// ============================================================
// React Query hooks for profile data
// Every screen goes through these hooks — never call API fns
// directly inside a component, so refetch & caching stay central.
// ============================================================

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { getMyProfile, toApiPatch, updateMyProfile, updateMySpecialization } from "@/lib/api/profile";
import type { User } from "@/types";

export const profileKeys = {
  all: ["profile"] as const,
  me: (userId: string) => ["profile", "me", userId] as const,
};

export function useMyProfile(userId: string | null) {
  return useQuery({
    queryKey: profileKeys.me(userId ?? ""),
    queryFn: () => getMyProfile(userId!),
    enabled: !!userId,
    staleTime: 60_000,
  });
}

export function useUpdateMyProfile(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<Pick<User, "full_name" | "phone" | "email" | "avatar_url">>) =>
      updateMyProfile(userId, toApiPatch(patch)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: profileKeys.me(userId) });
    },
  });
}

export function useUpdateMySpecialization(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (specializationId: string | null) =>
      updateMySpecialization(userId, specializationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: profileKeys.me(userId) });
    },
  });
}
