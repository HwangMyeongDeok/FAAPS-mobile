import { Pressable, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { ORANGE } from "../format";

/** One KPI tile: label, big value, optional caption. */
export function KpiTile({
  icon,
  label,
  value,
  caption,
}: {
  icon: string;
  label: string;
  value: string;
  caption?: string;
}) {
  return (
    <View
      className="flex-1 rounded-2xl border border-[#E5E7EB] bg-white px-3.5 py-3.5"
      style={{
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 1 },
        elevation: 1,
      }}
    >
      <View className="h-8 w-8 items-center justify-center rounded-lg bg-[#FFF1E7]">
        <MaterialCommunityIcons name={icon as never} size={16} color={ORANGE} />
      </View>
      <Text className="mt-2.5 text-[11px]" style={{ color: "#6B7280" }}>
        {label}
      </Text>
      <Text
        className="mt-0.5 text-[19px] tabular-nums"
        style={{ color: "#1A1A1A", fontWeight: "700" }}
      >
        {value}
      </Text>
      {caption ? (
        <Text className="mt-0.5 text-[10px]" style={{ color: "#6B7280" }}>
          {caption}
        </Text>
      ) : null}
    </View>
  );
}

/** A single "coming up" row: icon block, title, meta, chevron. */
export function UpcomingRow({
  icon,
  title,
  meta,
  badge,
  onPress,
}: {
  icon: string;
  title: string;
  meta: string;
  badge?: React.ReactNode;
  onPress?: () => void;
}) {
  const body = (
    <>
      <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#FFF1E7]">
        <MaterialCommunityIcons name={icon as never} size={19} color={ORANGE} />
      </View>
      <View className="flex-1">
        <Text
          className="text-[14px]"
          style={{ color: "#1A1A1A", fontWeight: "700" }}
          numberOfLines={1}
        >
          {title}
        </Text>
        <Text className="mt-0.5 text-[11px]" style={{ color: "#6B7280" }} numberOfLines={1}>
          {meta}
        </Text>
      </View>
      {badge}
      <MaterialCommunityIcons name="chevron-right" size={18} color="#9CA3AF" />
    </>
  );

  if (!onPress) return <View className="flex-row items-center gap-3 px-4 py-3">{body}</View>;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      className="flex-row items-center gap-3 px-4 py-3 active:opacity-70"
    >
      {body}
    </Pressable>
  );
}
