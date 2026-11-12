import { Pressable, Text, useColorScheme } from "react-native";
import { ORANGE } from "../format";

interface FilterChipProps {
  label: string;
  count: number;
  active: boolean;
  onPress: () => void;
}

/** One filter chip: active is solid orange, inactive is an outline. */
export function FilterChip({ label, count, active, onPress }: FilterChipProps) {
  const isDark = useColorScheme() === "dark";
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      className="flex-row items-center gap-1.5 rounded-full px-3.5 py-2 active:opacity-70"
      style={
        active
          ? { backgroundColor: ORANGE }
          : {
              backgroundColor: "transparent",
              borderWidth: 1,
              borderColor: isDark ? "#302A24" : "#EAE1D8",
            }
      }
    >
      <Text
        className="text-xs font-bold"
        style={{ color: active ? "#FFFFFF" : isDark ? "#A79C93" : "#6A6058" }}
      >
        {label}
      </Text>
      <Text
        className="text-xs font-semibold tabular-nums"
        style={{
          color: active ? "rgba(255,255,255,0.8)" : isDark ? "#7D746C" : "#8B8178",
        }}
      >
        {count}
      </Text>
    </Pressable>
  );
}
