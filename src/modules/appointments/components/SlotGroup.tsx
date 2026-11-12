import { Pressable, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import type { AvailableSlot } from "@/types";
import { ORANGE, timeOf } from "../format";

interface SlotGroupProps {
  title: string;
  icon: string;
  slots: AvailableSlot[];
  selectedStart: string | null;
  onPick: (s: AvailableSlot) => void;
  isDark: boolean;
}

/** Morning / afternoon slot grid — 31% cards, selected day in flat orange. */
export function SlotGroup({
  title,
  icon,
  slots,
  selectedStart,
  onPick,
  isDark,
}: SlotGroupProps) {
  if (slots.length === 0) return null;
  return (
    <View className="mt-3">
      <View className="mb-2 flex-row items-center gap-1.5">
        <MaterialCommunityIcons name={icon as never} size={15} color={ORANGE} />
        <Text className="text-[13px] font-bold text-ink-muted dark:text-ink-muted-dark">
          {title} ({slots.length})
        </Text>
      </View>
      <View className="flex-row flex-wrap" style={{ gap: 10 }}>
        {slots.map((s) => {
          const selected = s.startTime === selectedStart;
          const label = timeOf(s.startTime);
          return (
            <Pressable
              key={s.startTime}
              onPress={() => onPick(s)}
              accessibilityRole="button"
              accessibilityLabel={`${label} to ${timeOf(s.endTime)}`}
              className="items-center justify-center rounded-2xl py-3.5 active:opacity-70 active:scale-[0.97]"
              style={{
                width: "31%",
                backgroundColor: selected ? ORANGE : isDark ? "#1B1815" : "#fff",
                borderWidth: 1.5,
                borderColor: selected ? ORANGE : isDark ? "#3A2A1C" : "#FFD9BE",
              }}
            >
              <Text
                className="text-[15px] font-bold tabular-nums"
                style={{ color: selected ? "#fff" : isDark ? "#F7F2EC" : "#191512" }}
              >
                {label}
              </Text>
              <Text
                className="mt-0.5 text-[10px] font-semibold"
                style={{
                  color: selected ? "rgba(255,255,255,0.85)" : isDark ? "#7D746C" : "#8B8178",
                }}
              >
                Open
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
