import { Pressable, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { cardShadow } from "@/lib/shadow";
import type { BookedAppointment } from "@/types";
import { ORANGE, dateOf, shortDate, timeOf } from "../format";

interface AppointmentCardProps {
  appointment: BookedAppointment;
  advisorName: string;
  isDark: boolean;
  highlight: boolean;
  onCancel: () => void;
}

/** One upcoming session: date band, reason, status, cancel action. */
export function AppointmentCard({
  appointment,
  advisorName,
  isDark,
  highlight,
  onCancel,
}: AppointmentCardProps) {
  const v = shortDate(dateOf(appointment.startTime));
  return (
    <View
      className="overflow-hidden rounded-3xl border bg-surface dark:bg-surface-dark"
      style={[
        {
          borderColor: highlight ? ORANGE : isDark ? "#302A24" : "#EAE1D8",
          borderWidth: highlight ? 2 : 1,
        },
        cardShadow(isDark),
      ]}
    >
      <View
        className="flex-row items-center gap-3 px-4 py-3"
        style={{ backgroundColor: isDark ? "#241F1B" : "#FFF6EE" }}
      >
        <View
          className="items-center justify-center rounded-2xl px-3 py-1.5"
          style={{ backgroundColor: ORANGE, minWidth: 58 }}
        >
          <Text className="text-lg font-bold leading-5 text-white tabular-nums">
            {v.day}
          </Text>
          <Text className="text-[10px] font-bold text-white">
            {v.mon} · {v.dow}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-[15px] font-bold text-ink tabular-nums dark:text-ink-dark">
            {timeOf(appointment.startTime)} – {timeOf(appointment.endTime)}
          </Text>
          <Text
            className="mt-0.5 text-[11px] text-ink-muted dark:text-ink-muted-dark"
            numberOfLines={1}
          >
            {advisorName}
          </Text>
        </View>
        {highlight ? (
          <View className="rounded-full px-2.5 py-1" style={{ backgroundColor: ORANGE }}>
            <Text className="text-[10px] font-bold text-white">NEW</Text>
          </View>
        ) : null}
      </View>
      <View className="px-4 py-3">
        <View className="flex-row gap-2">
          <MaterialCommunityIcons
            name="message-text-outline"
            size={15}
            color={isDark ? "#FFA371" : "#B5460D"}
            style={{ marginTop: 2 }}
          />
          <Text className="flex-1 text-[13px] leading-5 text-ink dark:text-ink-dark">
            {appointment.reason}
          </Text>
        </View>
        <View className="mt-3 flex-row gap-2.5">
          <View
            className="flex-1 flex-row items-center justify-center gap-1.5 rounded-2xl py-3"
            style={{ backgroundColor: isDark ? "#241F1B" : "#F2EDE7" }}
          >
            <MaterialCommunityIcons
              name="clock-outline"
              size={16}
              color={isDark ? "#FFA371" : "#B5460D"}
            />
            <Text
              className="text-xs font-bold"
              style={{ color: isDark ? "#FFA371" : "#B5460D" }}
            >
              {appointment.status === "PENDING" ? "Awaiting confirmation" : "Confirmed"}
            </Text>
          </View>
          <Pressable
            onPress={onCancel}
            accessibilityRole="button"
            accessibilityLabel="Cancel this session"
            className="flex-1 items-center justify-center rounded-2xl border py-3 active:opacity-70 active:scale-[0.98]"
            style={{ borderColor: "#FECACA", backgroundColor: isDark ? "#2A1512" : "#fff" }}
          >
            <Text className="text-xs font-bold" style={{ color: "#DC2626" }}>
              Cancel
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
