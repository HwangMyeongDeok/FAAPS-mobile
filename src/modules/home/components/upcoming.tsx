import { Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";

import { StatusBadge } from "@/components/ui/status";
import type { BookedAppointment, StudentAdvisor } from "@/types";
import { dateOf, shortDate, timeOf } from "@/modules/appointments/format";
import { UpcomingRow } from "./kpi";

const CARD_SHADOW = {
  shadowColor: "#000",
  shadowOpacity: 0.05,
  shadowRadius: 3,
  shadowOffset: { width: 0, height: 1 },
  elevation: 1,
} as const;

function SectionHeading({ title, action }: { title: string; action?: string }) {
  return (
    <View className="flex-row items-center justify-between px-4 pb-1 pt-4">
      <Text className="text-[13px]" style={{ color: "#6B7280", fontWeight: "600" }}>
        {title}
      </Text>
      {action ? (
        <Text
          className="text-[12px]"
          style={{ color: "#F37021", fontWeight: "700" }}
          onPress={() => router.push("/(app)/appointments")}
        >
          {action}
        </Text>
      ) : null}
    </View>
  );
}

/**
 * "Sắp tới" — the next advisor session plus a shortcut to the advisor.
 */
export function UpcomingSection({
  appointments,
  advisor,
}: {
  appointments: BookedAppointment[];
  advisor?: StudentAdvisor | null;
}) {
  const next = appointments
    .filter(
      (a) => a.status === "PENDING" || a.status === "ACCEPTED" || a.status === "SCHEDULED",
    )
    .sort((a, b) => a.startTime.localeCompare(b.startTime))[0];

  return (
    <View className="px-5 pt-5">
      <Text className="text-[15px]" style={{ color: "#1A1A1A", fontWeight: "700" }}>
        Sắp tới
      </Text>
      <View
        className="mt-3 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white"
        style={CARD_SHADOW}
      >
        {next ? (
          <>
            <SectionHeading title="Buổi gặp sắp tới" action="Lịch" />
            <UpcomingRow
              icon="calendar-clock"
              title={`${shortDate(dateOf(next.startTime)).dow} · ${timeOf(next.startTime)}`}
              meta={next.reason || "Session with your advisor"}
              badge={<StatusBadge status={next.status} />}
              onPress={() => router.push("/(app)/appointments")}
            />
            <View className="mx-4 h-px bg-[#E5E7EB]" />
          </>
        ) : null}

        {advisor ? (
          <UpcomingRow
            icon="account-tie-outline"
            title={advisor.fullName}
            meta={advisor.email ?? advisor.specialization ?? "Your advisor"}
            onPress={() => router.push("/(app)/advising")}
          />
        ) : (
          <View className="flex-row items-center gap-3 px-4 py-4">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#F3F4F6]">
              <MaterialCommunityIcons name="account-tie-outline" size={19} color="#6B7280" />
            </View>
            <View className="flex-1">
              <Text className="text-[14px]" style={{ color: "#1A1A1A", fontWeight: "700" }}>
                Chưa có cố vấn
              </Text>
              <Text className="mt-0.5 text-[11px]" style={{ color: "#6B7280" }}>
                Liên hệ văn phòng học vụ để được phân công.
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
