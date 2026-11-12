import { Pressable, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { goBack } from "@/components/ScreenHeader";
import { ORANGE } from "../format";

interface RoadmapHeaderProps {
  isDark: boolean;
  isRegenerating: boolean;
  onRegenerate: () => void;
  subtitle?: string;
}

/** Screen header: back, title, single "Regenerate" primary action. */
export function RoadmapHeader({
  isDark,
  isRegenerating,
  onRegenerate,
  subtitle,
}: RoadmapHeaderProps) {
  return (
    <View className="border-b border-line bg-surface px-4 pb-3 pt-2 dark:border-line-dark dark:bg-surface-dark">
      <View className="flex-row items-center gap-2">
        <Pressable
          onPress={goBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={10}
          className="-ml-1 h-10 w-10 items-center justify-center rounded-full active:opacity-70"
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={26}
            color={isDark ? "#F7F2EC" : "#191512"}
          />
        </Pressable>

        <View className="flex-1">
          <Text
            accessibilityRole="header"
            className="text-[17px] font-bold text-ink dark:text-ink-dark"
          >
            AI study roadmap
          </Text>
          <Text className="text-[11px] text-ink-muted dark:text-ink-muted-dark">
            {subtitle ?? "The AI's proposal for your remaining semesters"}
          </Text>
        </View>

        <Pressable
          onPress={onRegenerate}
          disabled={isRegenerating}
          accessibilityRole="button"
          accessibilityLabel="Regenerate the roadmap"
          className="flex-row items-center gap-1.5 rounded-full px-3.5 py-2.5 active:opacity-80"
          style={{ backgroundColor: ORANGE, opacity: isRegenerating ? 0.7 : 1 }}
        >
          <MaterialCommunityIcons name="refresh" size={15} color="#FFFFFF" />
          <Text className="text-[12px] font-bold text-white">Regenerate</Text>
        </Pressable>
      </View>
    </View>
  );
}
