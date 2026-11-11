/**
 * Notifications service — the in-app notification centre.
 */
import { http } from "@/lib/http";
import type { NotificationPage } from "@/types";

export type { AppNotification } from "@/types";

/** `GET /api/student/notifications?unreadOnly=&page=&size=` */
export async function getNotifications(
  options: { unreadOnly?: boolean; page?: number; size?: number } = {},
): Promise<NotificationPage> {
  const query = new URLSearchParams({
    unreadOnly: String(options.unreadOnly ?? false),
    page: String(options.page ?? 0),
    size: String(options.size ?? 50),
  });
  return http.get<NotificationPage>(`/api/student/notifications?${query}`);
}

/** `GET /api/student/notifications/unread-count` */
export async function getUnreadCount(): Promise<number> {
  const body = await http.get<{ unreadCount: number }>(
    "/api/student/notifications/unread-count",
  );
  return body.unreadCount ?? 0;
}

/** `PATCH /api/student/notifications/{id}/read` */
export async function markNotificationRead(notificationId: string): Promise<void> {
  await http.patch<{ updated: boolean }>(
    `/api/student/notifications/${notificationId}/read`,
  );
}

/** `PATCH /api/student/notifications/read-all` */
export async function markAllNotificationsRead(): Promise<void> {
  await http.patch<{ updated: number }>("/api/student/notifications/read-all");
}
