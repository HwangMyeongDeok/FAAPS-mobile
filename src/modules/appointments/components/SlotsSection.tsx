import { Text, View } from "react-native";
import { CalendarX2, Clock, UserX } from "lucide-react-native";

import { AppCard } from "@/components/ui/AppCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonBlock } from "@/components/ui/SkeletonBlock";
import type { AvailableSlot } from "@/types";
import { ErrorBlock } from "@/components/feedback";
import { SlotGroup } from "./SlotGroup";

interface SlotsSectionProps {
  advisorLoading: boolean;
  slotsLoading: boolean;
  advisorError: boolean;
  slotsError: boolean;
  hasNoAdvisor: boolean;
  slots: AvailableSlot[];
  morning: AvailableSlot[];
  afternoon: AvailableSlot[];
  selectedStart: string | null;
  isDark: boolean;
  onPick: (s: AvailableSlot) => void;
  onRetryAdvisor: () => void;
  onRetrySlots: () => void;
}

const INK = "#1A1A1A";
const MUTED = "#6B7280";
const ORANGE = "#F37021";

/** Free-slot picker: header count + loading / error / empty + morning/afternoon grids. */
export function SlotsSection({
  advisorLoading,
  slotsLoading,
  advisorError,
  slotsError,
  hasNoAdvisor,
  slots,
  morning,
  afternoon,
  selectedStart,
  onPick,
  onRetryAdvisor,
  onRetrySlots,
}: SlotsSectionProps) {
  const headerCount =
    advisorLoading || slotsLoading
      ? "Đang tải…"
      : advisorError || hasNoAdvisor
        ? "Không khả dụng"
        : `${slots.length} slot trống`;

  return (
    <View className="px-5 pt-5">
      <View className="flex-row items-end justify-between">
        <Text className="text-[15px]" style={{ color: INK, fontWeight: "700" }}>
          Khung giờ trống
        </Text>
        <Text className="text-[12px]" style={{ color: ORANGE, fontWeight: "700" }}>
          {headerCount}
        </Text>
      </View>
      <Text className="mt-1 text-[12px]" style={{ color: MUTED }}>
        Mỗi buổi kéo dài 30 phút · chạm vào giờ để chọn
      </Text>

      {advisorLoading || slotsLoading ? (
        <View className="mt-3">
          <SkeletonBlock height={64} radius={12} />
          <View className="mt-2 flex-row gap-2.5">
            <SkeletonBlock height={60} radius={12} className="flex-1" />
            <SkeletonBlock height={60} radius={12} className="flex-1" />
            <SkeletonBlock height={60} radius={12} className="flex-1" />
          </View>
          <View className="mt-2 flex-row gap-2.5">
            <SkeletonBlock height={60} radius={12} className="flex-1" />
            <SkeletonBlock height={60} radius={12} className="flex-1" />
            <SkeletonBlock height={60} radius={12} className="flex-1" />
          </View>
        </View>
      ) : advisorError ? (
        <View className="mt-3">
          <ErrorBlock
            title="Không tải được lịch rảnh"
            message="Kiểm tra kết nối và thử lại."
            onRetry={onRetryAdvisor}
          />
        </View>
      ) : slotsError ? (
        <View className="mt-3">
          <ErrorBlock
            title="Không tải được lịch rảnh"
            message="Không thể xem giờ rảnh của ngày này."
            onRetry={onRetrySlots}
          />
        </View>
      ) : hasNoAdvisor ? (
        <AppCard className="mt-3" padded={false}>
          <EmptyState
            muted
            icon={<UserX size={24} color={MUTED} />}
            title="Chưa có cố vấn"
            message="Bạn chưa được phân công cố vấn. Vui lòng liên hệ quản trị viên."
          />
        </AppCard>
      ) : slots.length === 0 ? (
        <AppCard className="mt-3" padded={false}>
          <EmptyState
            muted
            icon={<CalendarX2 size={24} color={MUTED} />}
            title="Hôm nay không còn giờ trống"
            message="Chọn một ngày trong tuần khác để xem các khung giờ trống."
          />
        </AppCard>
      ) : (
        <AppCard className="mt-3">
          <View className="flex-row items-center gap-1.5">
            <Clock size={13} color={MUTED} />
            <Text className="text-[11px]" style={{ color: MUTED, fontWeight: "600" }}>
              Chọn một khung giờ bên dưới
            </Text>
          </View>
          <SlotGroup
            title="Buổi sáng"
            icon="sun"
            slots={morning}
            selectedStart={selectedStart}
            onPick={onPick}
            isDark={false}
          />
          <SlotGroup
            title="Buổi chiều"
            icon="cloud"
            slots={afternoon}
            selectedStart={selectedStart}
            onPick={onPick}
            isDark={false}
          />
        </AppCard>
      )}
    </View>
  );
}
