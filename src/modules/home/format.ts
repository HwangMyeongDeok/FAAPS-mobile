/**
 * Home module — pure helpers shared by the dashboard sections.
 */

export const ORANGE = "#F36F21";
export const ORANGE_DEEP = "#B5460D";

export function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 11) return "Good morning";
  if (h < 14) return "Good afternoon";
  if (h < 18) return "Good evening";
  return "Good night";
}

export function firstName(full: string): string {
  const parts = full.trim().split(/\s+/);
  return parts[parts.length - 1] ?? full;
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

export function today(): string {
  const d = new Date();
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function gpaRank(gpa: number | null): { label: string; color: string; bg: string } {
  const value = gpa ?? 0;
  if (value >= 8) return { label: "Excellent", color: "#047857", bg: "rgba(255,255,255,0.22)" };
  if (value >= 6.5) return { label: "Good", color: "#FFFFFF", bg: "rgba(255,255,255,0.22)" };
  if (value >= 5) return { label: "Average", color: "#FFFFFF", bg: "rgba(255,255,255,0.22)" };
  return { label: "Needs improvement", color: "#FFFFFF", bg: "rgba(0,0,0,0.22)" };
}

export const NOTIFICATION_DOT: Record<string, string> = {
  PLAN_STATUS: ORANGE,
  MESSAGE: "#2563EB",
  ADVISOR_REQUEST: "#2563EB",
  REMINDER: "#059669",
  WARNING: "#DC2626",
  INFO: "#9CA3AF",
};

export const NOTIFICATION_LABEL: Record<string, string> = {
  PLAN_STATUS: "Study plan",
  MESSAGE: "Message",
  ADVISOR_REQUEST: "Advisor",
  REMINDER: "Reminder",
  WARNING: "Warning",
  INFO: "System",
};

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
