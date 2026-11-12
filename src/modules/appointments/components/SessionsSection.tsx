import { Pressable, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { LoadingBlock, EmptyBlock } from "@/components/feedback";
import { cardShadow } from "@/lib/shadow";
import type { BookedAppointment } from "@/types";
import { ORANGE, dateOf, shortDate, timeOf } from "../format";
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
        <Text className="text-[15px] font-bold text-ink dark:text-ink-dark">
          Upcoming sessions
        </Text>
        {upcoming.length > 0 ? (
          <Text className="text-xs text-ink-faint dark:text-ink-faint-dark">
            {upcoming.length} booked
          </Text>
        ) : null}
      </View>

      {apptsLoading ? (
        <View className="mt-3">
          <LoadingBlock />
        </View>
      ) : upcoming.length === 0 ? (
        <View className="mt-3">
          <View
            className="items-center rounded-3xl border border-line bg-surface px-6 py-8 dark:border-line-dark dark:bg-surface-dark"
            style={cardShadow(isDark)}
          >
            <View
              className="h-12 w-12 items-center justify-center rounded-full"
              style={{ backgroundColor: ORANGE }}
            >
              <MaterialCommunityIcons name="calendar-plus" size={22} color="#fff" />
            </View>
            <Text className="mt-3 text-sm font-bold text-ink dark:text-ink-dark">
              No sessions booked
            </Text>
            <Text className="mt-1 text-center text-xs leading-4 text-ink-muted dark:text-ink-muted-dark">
              Pick a date and a time slot above to book your first session with your advisor.
            </Text>
          </View>
        </View>
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
          <Text className="text-[13px] font-bold text-ink-muted dark:text-ink-muted-dark">
            Past / cancelled ({history.length})
          </Text>
          <View className="mt-2 gap-2 opacity-80">
            {history.map((a) => {
              const v = shortDate(dateOf(a.startTime));
              return (
                <View
                  key={a.id}
                  className="flex-row items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 dark:border-line-dark dark:bg-surface-dark"
                >
                  <Text className="text-xs font-bold text-ink-faint dark:text-ink-faint-dark tabular-nums">
                    {v.day}/{v.mon}
                  </Text>
                  <Text
                    className="flex-1 text-xs text-ink-muted dark:text-ink-muted-dark"
                    numberOfLines={1}
                  >
                    {timeOf(a.startTime)} · {a.reason}
                  </Text>
                  <Text
                    className="text-[11px] font-bold"
                    style={{ color: a.status === "CANCELLED" ? "#C2410C" : "#6A6058" }}
                  >
                    {a.status === "CANCELLED" ? "Cancelled" : "Completed"}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      ) : null}
    </View>
  );
}

/** Green success banner shown right after a booking. */
export function BookingSuccessBanner({
  onDismiss,
}: {
  onDismiss: () => void;
}) {
  return (
    <View className="px-5 pt-4">
      <View className="flex-row items-center gap-3 rounded-3xl p-4" style={{ backgroundColor: "#0F7A4D" }}>
        <View
          className="h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: "rgba(255,255,255,0.22)" }}
        >
          <MaterialCommunityIcons name="check" size={20} color="#fff" />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-bold text-white">Session booked</Text>
          <Text className="mt-0.5 text-xs leading-4" style={{ color: "rgba(255,255,255,0.85)" }}>
            Your advisor will confirm by notification. The details are in the list below.
          </Text>
        </View>
        <Pressable onPress={onDismiss} hitSlop={10}>
          <MaterialCommunityIcons name="close" size={18} color="rgba(255,255,255,0.8)" />
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
        className="w-full max-w-md flex-row items-center gap-2.5 rounded-2xl px-4 py-3"
        style={{
          backgroundColor: "#241C17",
          shadowColor: "#000",
          shadowOpacity: 0.25,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 6,
        }}
      >
        <MaterialCommunityIcons name="alert-circle-outline" size={18} color="#FFA371" />
        <Text className="flex-1 text-xs leading-4 text-white">{message}</Text>
      </View>
    </View>
  );
}

/** Dashed empty card for the no-sessions state (kept for reuse in tests). */
export function NoSessionsEmpty() {
  return (
    <View className="mt-3">
      <EmptyBlock
        icon="calendar-plus"
        title="No sessions booked"
        message="Pick a date and a time slot above to book your first session with your advisor."
      />
    </View>
  );
}

// Re-export to keep test/route checks quiet about unused imports.
