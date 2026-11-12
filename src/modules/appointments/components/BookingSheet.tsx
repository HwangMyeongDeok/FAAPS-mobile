import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import type { AvailableSlot, StudentAdvisor } from "@/types";
import { ORANGE, QUICK_REASONS, dateOf, initials, longDate, timeOf } from "../format";

interface BookingSheetContentProps {
  selectedSlot: AvailableSlot;
  advisor?: StudentAdvisor | null;
  reason: string;
  reasonError: string | null;
  pending: boolean;
  bookError: boolean;
  isDark: boolean;
  onReasonChange: (v: string) => void;
  onQuickPick: (q: string) => void;
  onConfirm: () => void;
  onPickAnother: () => void;
}

/** Inner content of the booking sheet — advisor summary + reason form + CTA. */
export function BookingSheetContent({
  selectedSlot,
  advisor,
  reason,
  reasonError,
  pending,
  bookError,
  isDark,
  onReasonChange,
  onQuickPick,
  onConfirm,
  onPickAnother,
}: BookingSheetContentProps) {
  return (
    <View>
      <View className="flex-row items-center gap-3">
        <View
          className="h-12 w-12 items-center justify-center rounded-2xl"
          style={{ backgroundColor: ORANGE }}
        >
          <MaterialCommunityIcons name="calendar-clock" size={22} color="#fff" />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-bold text-ink dark:text-ink-dark">
            Confirm the booking
          </Text>
          <Text className="mt-0.5 text-xs text-ink-muted dark:text-ink-muted-dark">
            {longDate(dateOf(selectedSlot.startTime))} · {timeOf(selectedSlot.startTime)}–
            {timeOf(selectedSlot.endTime)}
          </Text>
        </View>
      </View>

      <View
        className="mt-4 flex-row items-center gap-3 rounded-2xl p-3"
        style={{ backgroundColor: isDark ? "#241F1B" : "#FFF1E7" }}
      >
        <View
          className="h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: isDark ? "#2E1C0E" : "#FFE5D4" }}
        >
          <Text
            className="text-sm font-bold"
            style={{ color: isDark ? "#FFA371" : "#B5460D" }}
          >
            {advisor ? initials(advisor.fullName) : "AD"}
          </Text>
        </View>
        <View className="flex-1">
          <Text
            className="text-sm font-bold text-ink dark:text-ink-dark"
            numberOfLines={1}
          >
            {advisor?.fullName ?? "Your advisor"}
          </Text>
          <Text className="text-[11px] text-ink-muted dark:text-ink-muted-dark">
            30 minutes · in person or online
          </Text>
        </View>
        <View className="rounded-full px-2.5 py-1" style={{ backgroundColor: ORANGE }}>
          <Text className="text-[11px] font-bold text-white tabular-nums">
            {timeOf(selectedSlot.startTime)}
          </Text>
        </View>
      </View>

      <Text className="mb-1.5 mt-4 text-sm font-bold text-ink dark:text-ink-dark">
        Reason for the session <Text style={{ color: ORANGE }}>*</Text>
      </Text>
      <View className="mb-2 flex-row flex-wrap gap-2">
        {QUICK_REASONS.map((q) => (
          <Pressable
            key={q}
            onPress={() => onQuickPick(q)}
            className="rounded-full border px-3 py-2 active:opacity-70 active:scale-[0.97]"
            style={{
              borderColor: isDark ? "#302A24" : "#EAE1D8",
              backgroundColor: isDark ? "#1B1815" : "#fff",
            }}
          >
            <Text className="text-xs font-semibold text-ink-muted dark:text-ink-muted-dark">
              {q}
            </Text>
          </Pressable>
        ))}
      </View>
      <TextInput
        value={reason}
        onChangeText={onReasonChange}
        placeholder="e.g. I want advice on which courses to take next semester given my current GPA and the AI track…"
        placeholderTextColor={isDark ? "#7D746C" : "#8B8178"}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        className="min-h-[110px] rounded-2xl border px-4 py-3 text-sm leading-5 text-ink dark:text-ink-dark"
        style={{
          borderColor: reasonError ? "#DC2626" : isDark ? "#302A24" : "#EAE1D8",
          backgroundColor: isDark ? "#12100E" : "#FAF7F4",
        }}
      />
      {reasonError ? (
        <Text className="mt-1.5 text-xs font-semibold" style={{ color: "#DC2626" }}>
          {reasonError}
        </Text>
      ) : (
        <Text className="mt-1.5 text-[11px] text-ink-faint dark:text-ink-faint-dark">
          {reason.trim().length}/500 characters · the more specific, the better your
          advisor can prepare
        </Text>
      )}

      <Pressable
        onPress={onConfirm}
        disabled={pending}
        accessibilityRole="button"
        accessibilityLabel="Confirm the booking"
        className="mt-4 flex-row items-center justify-center gap-2 rounded-2xl py-4 active:opacity-85 active:scale-[0.99]"
        style={{ backgroundColor: ORANGE, opacity: pending ? 0.7 : 1 }}
      >
        {pending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <MaterialCommunityIcons name="check-circle-outline" size={19} color="#fff" />
            <Text className="text-[15px] font-bold text-white">Confirm booking</Text>
          </>
        )}
      </Pressable>
      {bookError ? (
        <Text className="mt-2 text-center text-xs font-semibold" style={{ color: "#DC2626" }}>
          The booking failed. Please try again.
        </Text>
      ) : null}
      <Pressable onPress={onPickAnother} className="mt-1 items-center py-3 active:opacity-70" hitSlop={10}>
        <Text className="text-sm font-semibold text-ink-muted dark:text-ink-muted-dark">
          Pick another slot
        </Text>
      </Pressable>
    </View>
  );
}
