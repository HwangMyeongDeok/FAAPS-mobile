import { Text, View } from "react-native";

import { AppBadge, type BadgeTone } from "@/components/ui/AppBadge";

/**
 * Maps a domain status string to the shared badge tone so every screen
 * renders the same colour for the same meaning.
 */
export function statusTone(status: string): BadgeTone {
  switch (status) {
    case "PENDING":
    case "OPEN":
    case "IN_PROGRESS":
    case "SCHEDULED":
    case "PLANNED":
      return "primary";
    case "ACCEPTED":
    case "RESOLVED":
    case "COMPLETED":
    case "PASSED":
      return "success";
    case "PROBATION":
    case "WARNING":
      return "warning";
    case "REJECTED":
    case "CANCELLED":
    case "FAILED":
      return "danger";
    default:
      return "neutral";
  }
}

/** Human label for a status, kept next to the tone map. */
export const STATUS_TEXT: Record<string, string> = {
  PENDING: "Pending",
  OPEN: "Open",
  IN_PROGRESS: "In progress",
  SCHEDULED: "Scheduled",
  ACCEPTED: "Accepted",
  RESOLVED: "Resolved",
  COMPLETED: "Completed",
  PASSED: "Passed",
  CANCELLED: "Cancelled",
  REJECTED: "Rejected",
  PLANNED: "Planned",
  WARNING: "Warning",
  PROBATION: "Probation",
  EXEMPTED: "Exempted",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <AppBadge label={STATUS_TEXT[status] ?? status} tone={statusTone(status)} />
  );
}

/** Thin divider used between list rows. */
export function RowDivider() {
  return <View className="h-px bg-[#E5E7EB] dark:bg-[#2C2620]" />;
}

/** Small caption used under a card title. */
export function Caption({ children }: { children: React.ReactNode }) {
  return (
    <Text className="text-[12px] leading-[17px]" style={{ color: "#6B7280" }}>
      {children}
    </Text>
  );
}
