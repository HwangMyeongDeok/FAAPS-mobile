import { Pressable, Text, View } from "react-native";
import { ChevronRight, type LucideIcon } from "lucide-react-native";

import { AppCard } from "@/components/ui/AppCard";

export const INK = "#1A1A1A";
export const MUTED = "#6B7280";
export const DANGER = "#EF4444";
export const ORANGE = "#F37021";

interface MenuRowProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  onPress: () => void;
  /** Red text + icon and no chevron — used by "Sign out". */
  destructive?: boolean;
  isLast?: boolean;
}

/** A menu row: tinted icon square, title, optional subtitle, chevron. */
export function MenuRow({ icon: Icon, title, subtitle, onPress, destructive, isLast }: MenuRowProps) {
  const tint = destructive ? "#FEF2F2" : "#FFF1E7";
  const fg = destructive ? DANGER : ORANGE;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      className="flex-row items-center gap-3 px-4 py-3.5 active:opacity-70"
      style={isLast ? undefined : { borderBottomWidth: 1, borderBottomColor: "#E5E7EB" }}
    >
      <View
        className="h-9 w-9 items-center justify-center rounded-xl"
        style={{ backgroundColor: tint }}
      >
        <Icon size={17} color={fg} />
      </View>
      <View className="flex-1">
        <Text className="text-[14px]" style={{ color: destructive ? DANGER : INK, fontWeight: "600" }}>
          {title}
        </Text>
        {subtitle ? (
          <Text className="mt-0.5 text-[11px]" style={{ color: MUTED }} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <ChevronRight size={18} color={destructive ? "#FCA5A5" : "#9CA3AF"} />
    </Pressable>
  );
}

/** Card-wrapped group of menu rows. */
export function MenuGroup({ children }: { children: React.ReactNode }) {
  return <AppCard padded={false} className="overflow-hidden">{children}</AppCard>;
}
