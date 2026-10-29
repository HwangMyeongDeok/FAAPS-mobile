/**
 * Notifications service — in-app & push notifications.
 *
 * Mock data shows reminders about study plan updates, advisor replies, etc.
 */
import { config } from "@/config/api";
// Reserved for wiring the real backend — the endpoint calls below are still
// commented out, so ESLint would otherwise flag this as an unused import.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { request } from "@/lib/http";

const NETWORK_DELAY_MS = 400;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type NotificationKind = "PLAN" | "ADVISOR" | "SYSTEM" | "GRADE";

export interface AppNotification {
  id: string;
  user_id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  created_at: string;
  read_at: string | null;
  /** Deep link target, e.g. `/(app)/plan` */
  href?: string;
}

const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: "n-1",
    user_id: "u-student-duc",
    kind: "ADVISOR",
    title: "Tin nhắn mới từ advisor",
    body: "Thầy Thông đã trả lời câu hỏi về kế hoạch học tập.",
    created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    read_at: null,
    href: "/(app)/messages/conv-1",
  },
  {
    id: "n-2",
    user_id: "u-student-duc",
    kind: "PLAN",
    title: "Kế hoạch học tập đã được cập nhật",
    body: "AI đã sinh lại kế hoạch dựa trên GPA mới nhất của bạn.",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    read_at: null,
    href: "/(app)/plan",
  },
  {
    id: "n-3",
    user_id: "u-student-duc",
    kind: "SYSTEM",
    title: "Chào mừng đến với FAAPS!",
    body: "Bắt đầu khám phá các tính năng của FAAPS Mobile.",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    read_at: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString(),
  },
];

export async function getNotifications(userId: string): Promise<AppNotification[]> {
  if (config.isMockMode) {
    await wait(NETWORK_DELAY_MS);
    return MOCK_NOTIFICATIONS.filter((n) => n.user_id === userId);
  }
  // return request<AppNotification[]>(`/users/${userId}/notifications`);
  throw new Error("Not configured");
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  if (config.isMockMode) {
    await wait(150);
    const n = MOCK_NOTIFICATIONS.find((x) => x.id === notificationId);
    if (n) n.read_at = new Date().toISOString();
    return;
  }
  // await request<void>(`/notifications/${notificationId}/read`, { method: "POST" });
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  if (config.isMockMode) {
    await wait(200);
    const now = new Date().toISOString();
    MOCK_NOTIFICATIONS.forEach((n) => {
      if (n.user_id === userId) n.read_at = now;
    });
    return;
  }
  // await request<void>(`/users/${userId}/notifications/read-all`, { method: "POST" });
}