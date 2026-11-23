/**
 * AppBadge — a small status pill.
 *
 * DESIGN:
 * - Bo góc tròn, nhỏ, chữ 10–11px đậm.
 * - Cam #F37021 (primary/pending), xanh #10B981 (success/resolved),
 *   vàng #F59E0B (warning), đỏ #EF4444 (danger).
 */
import { cn } from "@/lib/utils";
import { Text, View } from "react-native";

export type BadgeTone = "primary" | "success" | "warning" | "danger" | "neutral";

const TONE: Record<BadgeTone, { bg: string; fg: string }> = {
  primary: { bg: "#FFF1E7", fg: "#B45309" },
  success: { bg: "#ECFDF5", fg: "#047857" },
  warning: { bg: "#FEF3E2", fg: "#B45309" },
  danger: { bg: "#FEF2F2", fg: "#B91C1C" },
  neutral: { bg: "#F3F4F6", fg: "#6B7280" },
};

interface AppBadgeProps {
  label: string;
  tone?: BadgeTone;
  /** Dấu chấm tròn trước nhãn. */
  dot?: boolean;
  className?: string;
}

export function AppBadge({ label, tone = "neutral", dot = false, className }: AppBadgeProps) {
  const t = TONE[tone];
  return (
    <View
      className={cn("flex-row items-center gap-1.5 self-start rounded-full px-2.5 py-1", className)}
      style={{ backgroundColor: t.bg }}
    >
      {dot ? (
        <View className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: t.fg }} />
      ) : null}
      <Text className="text-[10px] uppercase" style={{ color: t.fg, fontWeight: "700" }}>
        {label}
      </Text>
    </View>
  );
}
