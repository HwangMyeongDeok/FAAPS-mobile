import { Text, View } from "react-native";

import { Progress } from "@/components/ui/progress";
import type { StudentProfile } from "@/types";
import { ORANGE, firstName, getGreeting, initials, today } from "../format";
import { KpiTile } from "./kpi";
import { NotifBell } from "./common";

const CARD_SHADOW = {
  shadowColor: "#000",
  shadowOpacity: 0.05,
  shadowRadius: 3,
  shadowOffset: { width: 0, height: 1 },
  elevation: 1,
} as const;

/** Top bar: bell only — the avatar + greeting live in the hero below. */
export function DashboardTopBar({
  unreadCount,
  onNotif,
}: {
  unreadCount: number;
  onNotif: () => void;
}) {
  return (
    <View className="flex-row items-center justify-between px-5 pt-4">
      <Text className="text-[15px]" style={{ color: "#1A1A1A", fontWeight: "700" }}>
        FAAPS
      </Text>
      <NotifBell unread={unreadCount} onPress={onNotif} />
    </View>
  );
}

/**
 * Hero: round avatar + greeting + the one number that matters (GPA)
 * and how far along the curriculum is.
 */
export function DashboardHero({
  profile,
  gpa,
  stats,
}: {
  profile: StudentProfile;
  gpa: number | null;
  stats: { earned: number; total: number; pct: number; left: number };
}) {
  return (
    <View className="px-5 pt-4">
      <View
        className="rounded-2xl border border-[#E5E7EB] bg-white p-4"
        style={CARD_SHADOW}
      >
        <View className="flex-row items-center gap-3">
          <View
            className="h-14 w-14 items-center justify-center rounded-full"
            style={{ backgroundColor: ORANGE }}
          >
            <Text className="text-lg font-bold text-white">{initials(profile.fullName)}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-[11px]" style={{ color: "#6B7280" }}>
              {today()}
            </Text>
            <Text
              accessibilityRole="header"
              className="mt-0.5 text-[19px]"
              style={{ color: "#1A1A1A", fontWeight: "700" }}
              numberOfLines={1}
            >
              {getGreeting()}, {firstName(profile.fullName)}
            </Text>
            <Text className="mt-0.5 text-[11px]" style={{ color: "#6B7280" }} numberOfLines={1}>
              {profile.majorName ?? profile.majorCode ?? "FAAPS"} · Semester{" "}
              {profile.currentSemester ?? "—"}
            </Text>
          </View>
        </View>

        <View className="mt-4 flex-row items-end justify-between">
          <View>
            <Text className="text-[11px]" style={{ color: "#6B7280" }}>
              Cumulative GPA
            </Text>
            <View className="flex-row items-baseline gap-1">
              <Text
                className="text-[40px] leading-[44px] tabular-nums"
                style={{ color: "#1A1A1A", fontWeight: "700" }}
              >
                {gpa != null ? gpa.toFixed(2) : "—"}
              </Text>
              <Text className="text-[13px]" style={{ color: "#6B7280" }}>
                / 10
              </Text>
            </View>
          </View>
          <View className="items-end">
            <Text className="text-[11px]" style={{ color: "#6B7280" }}>
              Credits
            </Text>
            <Text
              className="text-[19px] tabular-nums"
              style={{ color: "#1A1A1A", fontWeight: "700" }}
            >
              {stats.earned}
              <Text className="text-[13px]" style={{ color: "#6B7280" }}>
                /{stats.total}
              </Text>
            </Text>
          </View>
        </View>

        <View className="mt-3">
          <Progress value={stats.pct} color="primary" />
        </View>
        <Text className="mt-1.5 text-[11px]" style={{ color: "#6B7280" }}>
          {stats.pct}% completed · {stats.left} credits left
        </Text>
      </View>
    </View>
  );
}

/** 2×2 KPI grid. */
export function KpiGrid({
  profile,
  gpa,
  stats,
}: {
  profile: StudentProfile;
  gpa: number | null;
  stats: { earned: number; total: number; pct: number; left: number };
}) {
  return (
    <View className="px-5 pt-5">
      <View className="flex-row gap-3">
        <KpiTile
          icon="school-outline"
          label="GPA"
          value={gpa != null ? gpa.toFixed(2) : "—"}
          caption="out of 10.00"
        />
        <KpiTile
          icon="chart-donut"
          label="Progress"
          value={`${stats.pct}%`}
          caption={`${stats.left} credits left`}
        />
      </View>
      <View className="mt-3 flex-row gap-3">
        <KpiTile
          icon="calendar-clock"
          label="Semester"
          value={String(profile.currentSemester ?? "—")}
          caption={profile.cohort ?? "Cohort"}
        />
        <KpiTile
          icon="account-check-outline"
          label="Status"
          value={profile.academicStatus ?? "ACTIVE"}
          caption={profile.studentCode ?? "Student ID"}
        />
      </View>
    </View>
  );
}
