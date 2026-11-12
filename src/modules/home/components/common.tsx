import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Skeleton } from "@/components/ui/skeleton";
import { cardShadow } from "@/lib/shadow";
import { ORANGE } from "../format";

/** Small section heading with an optional action link. */
export function SectionTitle({
  title,
  action,
  onPress,
}: {
  title: string;
  action?: string;
  onPress?: () => void;
}) {
  return (
    <View className="flex-row items-end justify-between">
      <Text className="text-[15px] font-bold text-ink dark:text-ink-dark">{title}</Text>
      {action ? (
        <Pressable onPress={onPress} hitSlop={10} className="active:opacity-70">
          <Text className="text-xs font-bold" style={{ color: ORANGE }}>
            {action}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/** Bell with unread badge. */
export function NotifBell({ unread, onPress }: { unread: number; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
      className="relative h-11 w-11 items-center justify-center rounded-full border border-line bg-surface active:opacity-70 active:scale-95 dark:border-line-dark dark:bg-surface-dark"
    >
      <MaterialCommunityIcons name="bell-outline" size={20} color="#191512" />
      {unread > 0 ? (
        <View
          className="absolute -right-0.5 -top-0.5 min-h-[20px] min-w-[20px] items-center justify-center rounded-full border-2 border-white px-1"
          style={{ backgroundColor: ORANGE }}
        >
          <Text className="text-[10px] font-bold text-white tabular-nums">
            {unread > 9 ? "9+" : unread}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

interface QuickCardProps {
  icon: string;
  title: string;
  desc: string;
  onPress: () => void;
  featured?: boolean;
}

/** 2×2 flat cards — the featured one wears deep orange. */
export function QuickCard({ icon, title, desc, onPress, featured }: QuickCardProps) {
  const featuredBg = "#D85A11";
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="flex-1 rounded-3xl border p-4 active:opacity-90 active:scale-[0.98]"
      style={
        featured
          ? { backgroundColor: featuredBg, borderColor: featuredBg }
          : { backgroundColor: "#FFFFFF", borderColor: "#EAE1D8" }
      }
    >
      <MaterialCommunityIcons name={icon as never} size={22} color={featured ? "#FFFFFF" : ORANGE} />
      <Text className="mt-3 text-sm font-bold" style={{ color: featured ? "#FFFFFF" : "#191512" }}>
        {title}
      </Text>
      <Text
        className="mt-0.5 text-[11px]"
        style={{ color: featured ? "rgba(255,255,255,0.82)" : "#6A6058" }}
        numberOfLines={1}
      >
        {desc}
      </Text>
      <View className="mt-3 flex-row items-center gap-1">
        <Text className="text-[11px] font-bold" style={{ color: featured ? "#FFFFFF" : ORANGE }}>
          Open
        </Text>
        <MaterialCommunityIcons
          name="chevron-right"
          size={14}
          color={featured ? "#FFFFFF" : ORANGE}
        />
      </View>
    </Pressable>
  );
}

/** Full-width navigation row (study plan / transcript). */
export function NavRow({
  icon,
  title,
  desc,
  badge,
  onPress,
  label,
  isDark,
}: {
  icon: string;
  title: string;
  desc: string;
  badge?: React.ReactNode;
  onPress: () => void;
  label: string;
  isDark: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="mt-3 flex-row items-center gap-3 rounded-3xl border border-line bg-surface p-4 active:opacity-80 active:scale-[0.99] dark:border-line-dark dark:bg-surface-dark"
      style={cardShadow(isDark)}
    >
      <View
        className="h-11 w-11 items-center justify-center rounded-2xl"
        style={{ backgroundColor: isDark ? "#2E1C0E" : "#FFF1E7" }}
      >
        <MaterialCommunityIcons name={icon as never} size={22} color={isDark ? "#FFA371" : ORANGE} />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-bold text-ink dark:text-ink-dark">{title}</Text>
        <Text className="mt-0.5 text-[11px] leading-4 text-ink-muted dark:text-ink-muted-dark">
          {desc}
        </Text>
      </View>
      {badge}
      <MaterialCommunityIcons
        name="chevron-right"
        size={22}
        color={isDark ? "#A79C93" : "#8B8178"}
      />
    </Pressable>
  );
}

/** Loading skeleton that mirrors the home layout. */
export function HomeSkeleton() {
  return (
    <View className="px-5 pt-4">
      <View className="flex-row items-center gap-3">
        <Skeleton width={48} height={48} className="rounded-full" />
        <View className="flex-1 gap-2">
          <Skeleton width="40%" height={12} />
          <Skeleton width="70%" height={18} />
        </View>
        <Skeleton width={44} height={44} className="rounded-full" />
      </View>
      <Skeleton height={280} className="mt-4 rounded-[28px]" />
      <View className="mt-4 flex-row gap-3">
        <Skeleton height={86} className="flex-1 rounded-3xl" />
        <Skeleton height={86} className="flex-1 rounded-3xl" />
      </View>
      <Skeleton width="45%" height={18} className="mt-6" />
      <View className="mt-3 flex-row gap-3">
        <Skeleton height={130} className="flex-1 rounded-3xl" />
        <Skeleton height={130} className="flex-1 rounded-3xl" />
      </View>
      <View className="mt-6 items-center">
        <ActivityIndicator color={ORANGE} />
      </View>
    </View>
  );
}

/** Small helper to avoid unused import warnings in re-exports. */
export function __homeCommonVersion() {
  return "home-common-1";
}

export { router as __routerRef };
