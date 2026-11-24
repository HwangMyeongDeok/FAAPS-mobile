import { Pressable, Text, View } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";

import { AppCard } from "@/components/ui/AppCard";
import { MONTHS, longDate, monthCells, toISODate } from "../format";

interface MonthCalendarProps {
  monthCursor: Date;
  selectedDate: string;
  todayISO: string;
  upcomingDates: Set<string>;
  isDark: boolean;
  onShiftMonth: (delta: number) => void;
  onPickDate: (iso: string) => void;
}

const ORANGE = "#F37021";
const INK = "#1A1A1A";
const MUTED = "#6B7280";

/**
 * Month calendar — 42 cells starting Monday, today ring, selected day in
 * flat orange, appointment dots. 40px touch targets.
 */
export function MonthCalendar({
  monthCursor,
  selectedDate,
  todayISO,
  upcomingDates,
  onShiftMonth,
  onPickDate,
}: MonthCalendarProps) {
  return (
    <View className="px-5 pt-5">
      <AppCard padded={false} className="p-4">
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => onShiftMonth(-1)}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Tháng trước"
            className="h-9 w-9 items-center justify-center rounded-full active:opacity-60"
            style={{ backgroundColor: "#F3F4F6" }}
          >
            <ChevronLeft size={18} color={INK} />
          </Pressable>
          <View className="items-center">
            <Text className="text-[15px]" style={{ color: INK, fontWeight: "700" }}>
              {MONTHS[monthCursor.getMonth()]} {monthCursor.getFullYear()}
            </Text>
            <Text className="mt-0.5 text-[11px]" style={{ color: MUTED }}>
              {longDate(selectedDate)}
            </Text>
          </View>
          <Pressable
            onPress={() => onShiftMonth(1)}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Tháng sau"
            className="h-9 w-9 items-center justify-center rounded-full active:opacity-60"
            style={{ backgroundColor: "#F3F4F6" }}
          >
            <ChevronRight size={18} color={INK} />
          </Pressable>
        </View>

        <View className="mt-3 flex-row">
          {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((w) => (
            <View key={w} className="flex-1 items-center py-1">
              <Text className="text-[11px]" style={{ color: MUTED, fontWeight: "700" }}>
                {w}
              </Text>
            </View>
          ))}
        </View>

        <View className="flex-row flex-wrap">
          {monthCells(monthCursor).map((d) => {
            const iso = toISODate(d);
            const inMonth = d.getMonth() === monthCursor.getMonth();
            const isSelected = iso === selectedDate;
            const isToday = iso === todayISO;
            const isPast = iso < todayISO;
            const isSunday = d.getDay() === 0;
            const disabled = isPast || isSunday;
            const hasAppt = upcomingDates.has(iso);
            return (
              <View key={iso} style={{ width: "14.28%" }} className="items-center py-0.5">
                <Pressable
                  onPress={() => !disabled && onPickDate(iso)}
                  disabled={disabled}
                  accessibilityRole="button"
                  accessibilityLabel={`${d.getDate()}/${d.getMonth() + 1}`}
                  className="items-center justify-center rounded-full active:opacity-70"
                  style={{
                    width: 38,
                    height: 38,
                    backgroundColor: isSelected ? ORANGE : "transparent",
                    borderWidth: isToday && !isSelected ? 1.5 : 0,
                    borderColor: ORANGE,
                    opacity: !inMonth ? 0.3 : disabled ? 0.35 : 1,
                  }}
                >
                  <Text
                    className="text-[13px] tabular-nums"
                    style={{
                      color: isSelected ? "#FFFFFF" : disabled || !inMonth ? "#9CA3AF" : INK,
                      fontWeight: isSelected || isToday ? "700" : "500",
                    }}
                  >
                    {d.getDate()}
                  </Text>
                  {hasAppt ? (
                    <View
                      className="absolute rounded-full"
                      style={{
                        width: 4,
                        height: 4,
                        bottom: 5,
                        backgroundColor: isSelected ? "#FFFFFF" : ORANGE,
                      }}
                    />
                  ) : null}
                </Pressable>
              </View>
            );
          })}
        </View>

        <View className="mt-2 flex-row items-center gap-4 px-1">
          <View className="flex-row items-center gap-1.5">
            <View className="h-2 w-2 rounded-full" style={{ backgroundColor: ORANGE }} />
            <Text className="text-[11px]" style={{ color: MUTED }}>
              Đã chọn
            </Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <View className="h-2 w-2 rounded-full border" style={{ borderColor: ORANGE }} />
            <Text className="text-[11px]" style={{ color: MUTED }}>
              Hôm nay
            </Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <View className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: ORANGE }} />
            <Text className="text-[11px]" style={{ color: MUTED }}>
              Có buổi gặp
            </Text>
          </View>
        </View>
      </AppCard>
    </View>
  );
}
