import { Pressable, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { cardShadow } from "@/lib/shadow";
import {
  MONTHS,
  ORANGE,
  longDate,
  monthCells,
  toISODate,
} from "../format";

interface MonthCalendarProps {
  monthCursor: Date;
  selectedDate: string;
  todayISO: string;
  upcomingDates: Set<string>;
  isDark: boolean;
  onShiftMonth: (delta: number) => void;
  onPickDate: (iso: string) => void;
}

/**
 * Month calendar — 42 cells starting Monday, today ring, selected day in
 * flat orange, appointment dots, legend. 40px touch targets.
 */
export function MonthCalendar({
  monthCursor,
  selectedDate,
  todayISO,
  upcomingDates,
  isDark,
  onShiftMonth,
  onPickDate,
}: MonthCalendarProps) {
  return (
    <View className="px-5 pt-4">
      <View
        className="rounded-3xl border border-line bg-surface p-4 dark:border-line-dark dark:bg-surface-dark"
        style={cardShadow(isDark)}
      >
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => onShiftMonth(-1)}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Previous month"
            className="h-11 w-11 items-center justify-center rounded-full active:opacity-60"
            style={{ backgroundColor: isDark ? "#241F1B" : "#F2EDE7" }}
          >
            <MaterialCommunityIcons
              name="chevron-left"
              size={22}
              color={isDark ? "#FFA371" : "#B5460D"}
            />
          </Pressable>
          <View className="items-center">
            <Text className="text-[16px] font-bold text-ink dark:text-ink-dark">
              {MONTHS[monthCursor.getMonth()]} {monthCursor.getFullYear()}
            </Text>
            <Text className="mt-0.5 text-[11px] text-ink-faint dark:text-ink-faint-dark">
              {longDate(selectedDate)}
            </Text>
          </View>
          <Pressable
            onPress={() => onShiftMonth(1)}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Next month"
            className="h-11 w-11 items-center justify-center rounded-full active:opacity-60"
            style={{ backgroundColor: isDark ? "#241F1B" : "#F2EDE7" }}
          >
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={isDark ? "#FFA371" : "#B5460D"}
            />
          </Pressable>
        </View>

        <View className="mt-3 flex-row">
          {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((w) => (
            <View key={w} className="flex-1 items-center py-1">
              <Text className="text-[11px] font-bold text-ink-faint dark:text-ink-faint-dark">
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
                    width: 40,
                    height: 40,
                    backgroundColor: isSelected ? ORANGE : "transparent",
                    borderWidth: isToday && !isSelected ? 1.5 : 0,
                    borderColor: ORANGE,
                    opacity: !inMonth ? 0.35 : disabled ? 0.4 : 1,
                  }}
                >
                  <Text
                    className="text-sm font-semibold tabular-nums"
                    style={{
                      color: isSelected
                        ? "#fff"
                        : !inMonth
                          ? isDark
                            ? "#7D746C"
                            : "#B4A79C"
                          : disabled
                            ? isDark
                              ? "#5A534B"
                              : "#B4A79C"
                            : isDark
                              ? "#F7F2EC"
                              : "#191512",
                      fontWeight: isSelected || isToday ? "700" : "600",
                    }}
                  >
                    {d.getDate()}
                  </Text>
                  {hasAppt && !isSelected ? (
                    <View
                      className="absolute rounded-full"
                      style={{ width: 5, height: 5, bottom: 6, backgroundColor: ORANGE }}
                    />
                  ) : null}
                  {isSelected && hasAppt ? (
                    <View
                      className="absolute rounded-full bg-white"
                      style={{ width: 5, height: 5, bottom: 6 }}
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
            <Text className="text-[11px] text-ink-muted dark:text-ink-muted-dark">Selected</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <View className="h-2 w-2 rounded-full border" style={{ borderColor: ORANGE }} />
            <Text className="text-[11px] text-ink-muted dark:text-ink-muted-dark">Today</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <View className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: ORANGE }} />
            <Text className="text-[11px] text-ink-muted dark:text-ink-muted-dark">Has a session</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
