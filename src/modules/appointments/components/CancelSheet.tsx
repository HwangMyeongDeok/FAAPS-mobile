import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import type { BookedAppointment } from "@/types";
import { CANCEL_REASONS, dateOf, longDate, timeOf } from "../format";

interface CancelSheetContentProps {
  cancelTarget: BookedAppointment;
  cancelReason: string;
  cancelCustom: string;
  pending: boolean;
  isDark: boolean;
  onPickReason: (r: string) => void;
  onCustomChange: (v: string) => void;
  onKeep: () => void;
  onConfirm: () => void;
}

/** Inner content of the cancel sheet — reason radio list + confirm. */
export function CancelSheetContent({
  cancelTarget,
  cancelReason,
  cancelCustom,
  pending,
  isDark,
  onPickReason,
  onCustomChange,
  onKeep,
  onConfirm,
}: CancelSheetContentProps) {
  const canConfirm = Boolean(cancelReason || cancelCustom.trim()) && !pending;
  return (
    <View>
      <View className="flex-row items-center gap-3">
        <View
          className="h-12 w-12 items-center justify-center rounded-2xl"
          style={{ backgroundColor: "#FEF2F2", borderWidth: 1, borderColor: "#FECACA" }}
        >
          <MaterialCommunityIcons name="calendar-remove-outline" size={22} color="#DC2626" />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-bold text-ink dark:text-ink-dark">
            Cancel this session?
          </Text>
          <Text className="mt-0.5 text-xs text-ink-muted dark:text-ink-muted-dark">
            {longDate(dateOf(cancelTarget.startTime))} · {timeOf(cancelTarget.startTime)}–
            {timeOf(cancelTarget.endTime)}
          </Text>
        </View>
      </View>

      <Text className="mb-2 mt-4 text-sm font-bold text-ink dark:text-ink-dark">
        Tell your advisor why <Text style={{ color: "#DC2626" }}>*</Text>
      </Text>
      <View className="gap-2">
        {CANCEL_REASONS.map((r) => {
          const active = cancelReason === r && !cancelCustom.trim();
          return (
            <Pressable
              key={r}
              onPress={() => onPickReason(r)}
              className="flex-row items-center gap-3 rounded-2xl border px-4 py-3.5 active:opacity-70"
              style={{
                borderColor: active ? "#DC2626" : isDark ? "#302A24" : "#EAE1D8",
                backgroundColor: active
                  ? isDark
                    ? "#2A1512"
                    : "#FEF2F2"
                  : isDark
                    ? "#1B1815"
                    : "#fff",
              }}
            >
              <View
                className="h-5 w-5 items-center justify-center rounded-full border-2"
                style={{ borderColor: active ? "#DC2626" : isDark ? "#4A423B" : "#C3B8AD" }}
              >
                {active ? (
                  <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#DC2626" }} />
                ) : null}
              </View>
              <Text
                className="flex-1 text-sm"
                style={{
                  color: active
                    ? isDark
                      ? "#FCA5A5"
                      : "#991B1B"
                    : isDark
                      ? "#F7F2EC"
                      : "#191512",
                  fontWeight: active ? "700" : "500",
                }}
              >
                {r}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <TextInput
        value={cancelCustom}
        onChangeText={onCustomChange}
        placeholder="Or write another reason…"
        placeholderTextColor={isDark ? "#7D746C" : "#8B8178"}
        className="mt-2 rounded-2xl border px-4 py-3 text-sm text-ink dark:text-ink-dark"
        style={{
          borderColor: isDark ? "#302A24" : "#EAE1D8",
          backgroundColor: isDark ? "#12100E" : "#FAF7F4",
        }}
      />

      <View className="mt-4 flex-row gap-2.5">
        <Pressable
          onPress={onKeep}
          className="flex-1 items-center justify-center rounded-2xl border py-4 active:opacity-70 active:scale-[0.98]"
          style={{ borderColor: isDark ? "#302A24" : "#EAE1D8" }}
        >
          <Text className="text-[15px] font-bold text-ink-muted dark:text-ink-muted-dark">
            Keep it
          </Text>
        </Pressable>
        <Pressable
          onPress={onConfirm}
          disabled={!canConfirm}
          className="flex-[1.4] items-center justify-center rounded-2xl py-4 active:opacity-85 active:scale-[0.99]"
          style={{ backgroundColor: "#DC2626", opacity: canConfirm ? 1 : 0.45 }}
        >
          {pending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-[15px] font-bold text-white">Confirm cancel</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
