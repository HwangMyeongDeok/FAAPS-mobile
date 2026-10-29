/**
 * Notifications service — in-app & push notifications.
 *
 * ── MOCK-FIRST STRATEGY ──────────────────────────────────────────────────────
 * The `else` branch already contains the real HTTP calls. Flip
 * `config.isMockMode` to false (app.json → extra, or EXPO_PUBLIC_MOCK_MODE)
 * to switch over.
 */
import { config } from "@/config/api";
import { http } from "@/lib/http";
import { getAuthToken } from "@/lib/api/token";
import { mockDelay } from "@/lib/db/mockDelay";
import { mockNotifications } from "@/lib/db/mockDb";
import type { AppNotification } from "@/types";

export type { AppNotification, NotificationKind } from "@/types";

export async function getNotifications(userId: string): Promise<AppNotification[]> {
  if (config.isMockMode) {
    await mockDelay();
    return mockNotifications
      .filter((n) => n.user_id === userId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  }

  // TODO: Wire BE later
  const token = await getAuthToken();
  return http.get<AppNotification[]>(`/api/users/${userId}/notifications`, { token });
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  if (config.isMockMode) {
    await mockDelay(150);
    const n = mockNotifications.find((x) => x.id === notificationId);
    if (n) n.read_at = new Date().toISOString();
    return;
  }

  // TODO: Wire BE later
  const token = await getAuthToken();
  await http.post<void>(`/api/notifications/${notificationId}/read`, undefined, { token });
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  if (config.isMockMode) {
    await mockDelay(200);
    const now = new Date().toISOString();
    mockNotifications
      .filter((n) => n.user_id === userId)
      .forEach((n) => {
        n.read_at = now;
      });
    return;
  }

  // TODO: Wire BE later
  const token = await getAuthToken();
  await http.post<void>(`/api/users/${userId}/notifications/read-all`, undefined, { token });
}
