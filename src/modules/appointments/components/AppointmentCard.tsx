import { Pressable, Text, View } from "react-native";
import { Clock, MessageSquare, X } from "lucide-react-native";

import { AppCard } from "@/components/ui/AppCard";
import { AppBadge } from "@/components/ui/AppBadge";
import type { BookedAppointment } from "@/types";
import { dateOf, shortDate, timeOf } from "../format";

interface AppointmentCardProps {
  appointment: BookedAppointment;
  advisorName: string;
  isDark: boolean;
  highlight: boolean;
  onCancel: () => void;
}

const ORANGE = "#F37021";
const INK = "#1A1A1A";
const MUTED = "#6B7280";

/** One upcoming session: date band, reason, status, cancel action. */
export function AppointmentCard({
  appointment,
  advisorName,
  highlight,
  onCancel,
}: AppointmentCardProps) {
  const v = shortDate(dateOf(appointment.startTime));
  return (
    <AppCard
      padded={false}
      className="overflow-hidden"
      style={highlight ? { borderColor: ORANGE, borderWidth: 1.5 } : undefined}
    >
      <View className="flex-row items-center gap-3 border-b border-[#E5E7EB] px-4 py-3">
        <View
          className="items-center justify-center rounded-xl px-3 py-1.5"
          style={{ backgroundColor: ORANGE, minWidth: 58 }}
        >
          <Text className="text-[18px] leading-5 tabular-nums" style={{ color: "#FFFFFF", fontWeight: "700" }}>
            {v.day}
          </Text>
          <Text className="text-[10px]" style={{ color: "#FFFFFF", fontWeight: "700" }}>
            {v.mon} · {v.dow}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-[15px] tabular-nums" style={{ color: INK, fontWeight: "700" }}>
            {timeOf(appointment.startTime)} – {timeOf(appointment.endTime)}
          </Text>
          <Text className="mt-0.5 text-[11px]" style={{ color: MUTED }} numberOfLines={1}>
            {advisorName}
          </Text>
        </View>
        <AppBadge
          label={appointment.status === "PENDING" ? "Chờ xác nhận" : "Đã xác nhận"}
          tone={appointment.status === "PENDING" ? "primary" : "success"}
        />
      </View>
      <View className="px-4 py-3">
        <View className="flex-row gap-2">
          <MessageSquare size={15} color={MUTED} style={{ marginTop: 2 }} />
          <Text className="flex-1 text-[13px] leading-5" style={{ color: INK }}>
            {appointment.reason}
          </Text>
        </View>
        <View className="mt-3 flex-row gap-2.5">
          <View
            className="flex-1 flex-row items-center justify-center gap-1.5 rounded-xl py-2.5"
            style={{ backgroundColor: "#F3F4F6" }}
          >
            <Clock size={15} color={MUTED} />
            <Text className="text-[12px]" style={{ color: MUTED, fontWeight: "600" }}>
              {appointment.status === "PENDING" ? "Chờ xác nhận" : "Đã xác nhận"}
            </Text>
          </View>
          <Pressable
            onPress={onCancel}
            accessibilityRole="button"
            accessibilityLabel="Huỷ buổi gặp này"
            className="flex-1 flex-row items-center justify-center gap-1.5 rounded-xl border py-2.5 active:opacity-70"
            style={{ borderColor: "#FECACA", backgroundColor: "#FFFFFF" }}
          >
            <X size={14} color="#EF4444" />
            <Text className="text-[12px]" style={{ color: "#EF4444", fontWeight: "700" }}>
              Huỷ
            </Text>
          </Pressable>
        </View>
      </View>
    </AppCard>
  );
}
