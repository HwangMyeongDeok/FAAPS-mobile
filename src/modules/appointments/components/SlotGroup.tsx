import { Pressable, Text, View } from "react-native";
import { Sun, CloudSun } from "lucide-react-native";

import type { AvailableSlot } from "@/types";
import { timeOf } from "../format";

interface SlotGroupProps {
  title: string;
  icon: "sun" | "cloud";
  slots: AvailableSlot[];
  selectedStart: string | null;
  onPick: (s: AvailableSlot) => void;
  isDark: boolean;
}

const ORANGE = "#F37021";
const INK = "#1A1A1A";
const MUTED = "#6B7280";

/** Morning / afternoon 30-minute slot chips. */
export function SlotGroup({ title, icon, slots, selectedStart, onPick }: SlotGroupProps) {
  if (slots.length === 0) return null;
  const Icon = icon === "sun" ? Sun : CloudSun;
  return (
    <View className="mt-3">
      <View className="mb-2 flex-row items-center gap-1.5">
        <Icon size={14} color={MUTED} />
        <Text className="text-[12px]" style={{ color: MUTED, fontWeight: "600" }}>
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
              accessibilityLabel={`${label} đến ${timeOf(s.endTime)}`}
              className="items-center justify-center rounded-xl py-3 active:opacity-70"
              style={{
                width: "31%",
                backgroundColor: selected ? ORANGE : "#FFF1E7",
                borderWidth: 1,
                borderColor: selected ? ORANGE : "#FFD9BE",
              }}
            >
              <Text
                className="text-[15px] tabular-nums"
                style={{ color: selected ? "#FFFFFF" : INK, fontWeight: "700" }}
              >
                {label}
              </Text>
              <Text
                className="mt-0.5 text-[10px]"
                style={{
                  color: selected ? "rgba(255,255,255,0.9)" : MUTED,
                  fontWeight: "600",
                }}
              >
                30 phút
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
