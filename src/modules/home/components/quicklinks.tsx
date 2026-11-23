import { Pressable, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const CARD_SHADOW = {
  shadowColor: "#000",
  shadowOpacity: 0.05,
  shadowRadius: 3,
  shadowOffset: { width: 0, height: 1 },
  elevation: 1,
} as const;

/** A quick link: icon block + label, tappable tile. */
export function QuickLinkTile({
  icon,
  title,
  onPress,
}: {
  icon: string;
  title: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      className="flex-1 items-center rounded-2xl border border-[#E5E7EB] bg-white px-2 py-3.5 active:opacity-80"
      style={CARD_SHADOW}
    >
      <View className="h-9 w-9 items-center justify-center rounded-xl bg-[#FFF1E7]">
        <MaterialCommunityIcons name={icon as never} size={18} color="#F37021" />
      </View>
      <Text
        className="mt-2 text-center text-[11px]"
        style={{ color: "#1A1A1A", fontWeight: "600" }}
        numberOfLines={2}
      >
        {title}
      </Text>
    </Pressable>
  );
}

/** Quick links grid — 2 columns × 3 rows. */
export function QuickLinks({
  links,
}: {
  links: { icon: string; title: string; onPress: () => void }[];
}) {
  const rows: { icon: string; title: string; onPress: () => void }[][] = [];
  for (let i = 0; i < links.length; i += 2) rows.push(links.slice(i, i + 2));

  return (
    <View className="px-5 pt-5">
      <Text className="text-[15px]" style={{ color: "#1A1A1A", fontWeight: "700" }}>
        Quick links
      </Text>
      <View className="mt-3 gap-3">
        {rows.map((row, i) => (
          <View key={i} className="flex-row gap-3">
            {row.map((l) => (
              <QuickLinkTile key={l.title} icon={l.icon} title={l.title} onPress={l.onPress} />
            ))}
            {row.length === 1 ? <View className="flex-1" /> : null}
          </View>
        ))}
      </View>
    </View>
  );
}
