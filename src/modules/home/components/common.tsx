import { Pressable, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { SkeletonBlock } from "@/components/ui/SkeletonBlock";
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
      <Text className="text-[15px] text-ink" style={{ fontWeight: "700" }}>
        {title}
      </Text>
      {action ? (
        <Pressable onPress={onPress} hitSlop={10} className="active:opacity-70">
          <Text className="text-[12px]" style={{ color: ORANGE, fontWeight: "700" }}>
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
      accessibilityLabel={unread > 0 ? `Thông báo, ${unread} chưa đọc` : "Thông báo"}
      className="relative h-11 w-11 items-center justify-center rounded-full border border-[#E5E7EB] bg-white active:opacity-70"
    >
      <MaterialCommunityIcons name="bell-outline" size={20} color="#1A1A1A" />
      {unread > 0 ? (
        <View
          className="absolute -right-0.5 -top-0.5 min-h-[20px] min-w-[20px] items-center justify-center rounded-full border-2 border-white px-1"
          style={{ backgroundColor: ORANGE }}
        >
          <Text className="text-[10px] tabular-nums" style={{ color: "#FFFFFF", fontWeight: "700" }}>
            {unread > 9 ? "9+" : unread}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

/** Loading skeleton that mirrors the dashboard layout. */
export function HomeSkeleton() {
  return (
    <View className="px-5 pt-4">
      <View className="flex-row items-center justify-between">
        <SkeletonBlock width={64} height={16} radius={6} />
        <SkeletonBlock width={44} height={44} radius={22} />
      </View>
      <SkeletonBlock height={210} radius={16} className="mt-4" />
      <View className="mt-5 flex-row gap-3">
        <SkeletonBlock height={92} radius={16} className="flex-1" />
        <SkeletonBlock height={92} radius={16} className="flex-1" />
      </View>
      <View className="mt-3 flex-row gap-3">
        <SkeletonBlock height={92} radius={16} className="flex-1" />
        <SkeletonBlock height={92} radius={16} className="flex-1" />
      </View>
      <SkeletonBlock width="35%" height={18} radius={6} className="mt-5" />
      <SkeletonBlock height={130} radius={16} className="mt-3" />
    </View>
  );
}

export { router as __routerRef };
