import { Pressable, Text, View } from "react-native";
import { AlertCircle, CalendarPlus, Check, X } from "lucide-react-native";

import { AppCard } from "@/components/ui/AppCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonBlock } from "@/components/ui/SkeletonBlock";
import { StatusBadge } from "@/components/ui/status";
import type { BookedAppointment } from "@/types";
import { shortDate, dateOf, timeOf } from "../format";
import { AppointmentCard } from "./AppointmentCard";

interface SessionsSectionProps {
  upcoming: BookedAppointment[];
  history: BookedAppointment[];
  apptsLoading: boolean;
  advisorName: string;
  justBookedId: string | null;
  isDark: boolean;
  onCancel: (a: BookedAppointment) => void;
}

const INK = "#1A1A1A";
const MUTED = "#6B7280";

/** Upcoming sessions + past/cancelled history. */
export function SessionsSection({
  upcoming,
  history,
  apptsLoading,
  advisorName,
  justBookedId,
  isDark,
  onCancel,
}: SessionsSectionProps) {
  return (
    <View className="px-5 pt-6">
      <View className="flex-row items-end justify-between">
        <Text className="text-[15px]" style={{ color: INK, fontWeight: "700" }}>
          Buổi gặp sắp tới
        </Text>
        {upcoming.length > 0 ? (
          <Text className="text-[12px]" style={{ color: MUTED }}>
            {upcoming.length} đã đặt
          </Text>
        ) : null}
      </View>

      {apptsLoading ? (
        <View className="mt-3">
          <SkeletonBlock height={140} radius={16} />
        </View>
      ) : upcoming.length === 0 ? (
        <AppCard className="mt-3" padded={false}>
          <EmptyState
            muted
            icon={<CalendarPlus size={24} color={MUTED} />}
            title="Chưa có buổi gặp nào"
            message="Chọn ngày và khung giờ ở trên để đặt buổi gặp đầu tiên với cố vấn."
          />
        </AppCard>
      ) : (
        <View className="mt-3 gap-3">
          {upcoming.map((a) => (
            <AppointmentCard
              key={a.id}
              appointment={a}
              advisorName={advisorName}
              isDark={isDark}
              highlight={a.id === justBookedId}
              onCancel={() => onCancel(a)}
            />
          ))}
        </View>
      )}

      {history.length > 0 ? (
        <View className="mt-5">
          <Text className="text-[13px]" style={{ color: MUTED, fontWeight: "700" }}>
            Đã qua / đã huỷ ({history.length})
          </Text>
          <View className="mt-2 gap-2">
            {history.map((a) => {
              const v = shortDate(dateOf(a.startTime));
              return (
                <AppCard key={a.id} padded={false} className="flex-row items-center gap-3 px-4 py-3">
                  <View
                    className="items-center justify-center rounded-lg px-2 py-1"
                    style={{ backgroundColor: "#F3F4F6", minWidth: 44 }}
                  >
                    <Text className="text-[13px] tabular-nums" style={{ color: INK, fontWeight: "700" }}>
                      {v.day}
                    </Text>
                    <Text className="text-[9px]" style={{ color: MUTED, fontWeight: "600" }}>
                      {v.mon}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-[12px] tabular-nums" style={{ color: INK, fontWeight: "600" }}>
                      {timeOf(a.startTime)} – {timeOf(a.endTime)}
                    </Text>
                    <Text className="text-[11px]" style={{ color: MUTED }} numberOfLines={1}>
                      {a.reason}
                    </Text>
                  </View>
                  <StatusBadge status={a.status} />
                </AppCard>
              );
            })}
          </View>
        </View>
      ) : null}
    </View>
  );
}

/** Green success banner shown right after a booking. */
export function BookingSuccessBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <View className="px-5 pt-4">
      <View
        className="flex-row items-center gap-3 rounded-2xl px-4 py-3.5"
        style={{ backgroundColor: "#ECFDF5", borderWidth: 1, borderColor: "#A7F3D0" }}
      >
        <View
          className="h-9 w-9 items-center justify-center rounded-full"
          style={{ backgroundColor: "#10B981" }}
        >
          <Check size={18} color="#FFFFFF" />
        </View>
        <View className="flex-1">
          <Text className="text-[13px]" style={{ color: "#047857", fontWeight: "700" }}>
            Đã đặt buổi gặp
          </Text>
          <Text className="mt-0.5 text-[11px] leading-4" style={{ color: "#047857" }}>
            Cố vấn sẽ xác nhận qua thông báo. Chi tiết nằm trong danh sách bên dưới.
          </Text>
        </View>
        <Pressable onPress={onDismiss} hitSlop={10} accessibilityLabel="Đóng thông báo">
          <X size={16} color="#047857" />
        </Pressable>
      </View>
    </View>
  );
}

/** Bottom toast for non-blocking errors. */
export function AppointmentToast({ message }: { message: string }) {
  return (
    <View pointerEvents="none" className="absolute inset-x-0 bottom-6 items-center px-6">
      <View
        className="w-full max-w-md flex-row items-center gap-2.5 rounded-xl px-4 py-3"
        style={{
          backgroundColor: "#1A1A1A",
          shadowColor: "#000",
          shadowOpacity: 0.25,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 6,
        }}
      >
        <AlertCircle size={18} color="#FCA5A5" />
        <Text className="flex-1 text-[12px] leading-4" style={{ color: "#FFFFFF" }}>
          {message}
        </Text>
      </View>
    </View>
  );
}

/** Dashed empty card for the no-sessions state (kept for reuse in tests). */
export function NoSessionsEmpty() {
  return (
    <AppCard className="mt-3" padded={false}>
      <EmptyState
        muted
        icon={<CalendarPlus size={24} color={MUTED} />}
        title="Chưa có buổi gặp nào"
        message="Chọn ngày và khung giờ ở trên để đặt buổi gặp đầu tiên với cố vấn."
      />
    </AppCard>
  );
}
