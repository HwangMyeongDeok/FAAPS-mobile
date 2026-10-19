/**
 * React Query hooks for in-app notifications.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/api/notifications";
import { useAuthStore } from "@/stores/auth";

export const notificationKeys = {
  all: ["notifications"] as const,
  list: (userId: string) => ["notifications", userId] as const,
};

export function useNotifications() {
  const userId = useAuthStore((s) => s.session?.user.id ?? null);
  return useQuery({
    queryKey: userId ? notificationKeys.list(userId) : ["notifications", "none"],
    queryFn: () => getNotifications(userId!),
    enabled: !!userId,
    staleTime: 60_000,
  });
}

export function useUnreadCount(): number {
  const { data } = useNotifications();
  return data ? data.filter((n) => n.read_at === null).length : 0;
}

export function useMarkNotificationRead() {
  const userId = useAuthStore((s) => s.session?.user.id ?? null);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) => markNotificationRead(notificationId),
    onSuccess: () => {
      if (userId) qc.invalidateQueries({ queryKey: notificationKeys.list(userId) });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const userId = useAuthStore((s) => s.session?.user.id ?? null);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => markAllNotificationsRead(userId!),
    onSuccess: () => {
      if (userId) qc.invalidateQueries({ queryKey: notificationKeys.list(userId) });
    },
  });
}