import { Text, View } from "react-native";
import type { AvailableSlot } from "@/types";
import { ErrorBlock, LoadingBlock, EmptyBlock } from "@/components/feedback";
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
  isDark,
  onPick,
  onRetryAdvisor,
  onRetrySlots,
}: SlotsSectionProps) {
  const headerCount = advisorLoading || slotsLoading
    ? "Loading…"
    : advisorError
      ? "Unavailable"
      : hasNoAdvisor
        ? "Unavailable"
        : `${slots.length} slots open`;

  return (
    <View className="px-5 pt-5">
      <View className="flex-row items-end justify-between">
        <Text className="text-[15px] font-bold text-ink dark:text-ink-dark">
          Free slots
        </Text>
        <Text className="text-xs font-semibold" style={{ color: "#B5460D" }}>
          {headerCount}
        </Text>
      </View>
      <Text className="mt-1 text-xs text-ink-muted dark:text-ink-muted-dark">
        Every session lasts 30 minutes · tap a time to pick it
      </Text>

      {advisorLoading ? (
        <View className="mt-3">
          <LoadingBlock message="Checking your advisor's availability…" />
        </View>
      ) : advisorError ? (
        <View className="mt-3">
          <ErrorBlock
            title="Availability unavailable"
            message="Could not load the availability for this day."
            onRetry={onRetryAdvisor}
          />
        </View>
      ) : slotsLoading ? (
        <View className="mt-3">
          <LoadingBlock message="Checking your advisor's availability…" />
        </View>
      ) : slotsError ? (
        <View className="mt-3">
          <ErrorBlock
            title="Availability unavailable"
            message="Could not load the availability for this day."
            onRetry={onRetrySlots}
          />
        </View>
      ) : hasNoAdvisor ? (
        <View className="mt-3">
          <EmptyBlock
            icon="account-alert-outline"
            title="No advisor assigned yet"
            message="You don't have an assigned advisor yet. Please contact the admin."
          />
        </View>
      ) : slots.length === 0 ? (
        <View className="mt-3">
          <EmptyBlock
            icon="bed-outline"
            title="No free slots on this day"
            message="Pick another weekday to see the open slots."
          />
        </View>
      ) : (
        <>
          <SlotGroup
            title="Morning"
            icon="weather-sunny"
            slots={morning}
            selectedStart={selectedStart}
            onPick={onPick}
            isDark={isDark}
          />
          <SlotGroup
            title="Afternoon"
            icon="weather-partly-cloudy"
            slots={afternoon}
            selectedStart={selectedStart}
            onPick={onPick}
            isDark={isDark}
          />
        </>
      )}
    </View>
  );
}
