export const ORANGE = "#F36F21";
export const ORANGE_DEEP = "#B5460D";

export const KIND_LABEL: Record<string, string> = {
  PLAN_STATUS: "Study plan",
  MESSAGE: "Message",
  ADVISOR_REQUEST: "Advisor",
  REMINDER: "Reminder",
  WARNING: "Warning",
  INFO: "System",
};

export const KIND_DOT: Record<string, string> = {
  PLAN_STATUS: ORANGE,
  MESSAGE: "#2563EB",
  ADVISOR_REQUEST: "#2563EB",
  REMINDER: "#059669",
  WARNING: "#DC2626",
  INFO: "#9CA3AF",
};

export type NotificationFilter = "all" | "unread";

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} d ago`;
  return new Date(iso).toLocaleDateString("en-US");
}
