/**
 * FE-S-1 — Home dashboard.
 *
 * The screen answers one question: "Where do I stand right now?"
 * It is built entirely from the real backend data:
 *   • `GET /api/student/profile`    → identity, major, current semester, GPA
 *   • `GET /api/student/progress`   → required vs earned credits
 *   • `GET /api/student/advisor`    → the assigned advisor
 *   • `GET /api/student/notifications` → the latest reminders
 */

import { useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";

import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyAdvisor, useMyProfile, useMyProgress } from "@/lib/queries/profile";
import { useNotifications, useUnreadCount } from "@/lib/queries/notifications";
import { useCourses } from "@/lib/queries/course";

// ─── FPT orange soul, warm paper ground ──────────────────────────────────────
// Direction: editorial-greeting (app home) mapped onto the FPT brand.
// Ground #FAF7F4, ink #191512, one flat orange #F36F21 for data + 1 action.
// No gradients, no icon-in-tinted-circle KPIs, numbers tabular & right-sized.

const ORANGE = "#F36F21";
const ORANGE_DEEP = "#B5460D";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 11) return "Good morning";
  if (h < 14) return "Good afternoon";
  if (h < 18) return "Good evening";
  return "Good night";
}

function firstName(full: string): string {
  const parts = full.trim().split(/\s+/);
  return parts[parts.length - 1] ?? full;
}

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function today(): string {
  const d = new Date();
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function gpaRank(gpa: number | null): { label: string; color: string; bg: string } {
  const value = gpa ?? 0;
  if (value >= 8)
    return { label: "Excellent", color: "#047857", bg: "rgba(255,255,255,0.22)" };
  if (value >= 6.5)
    return { label: "Good", color: "#FFFFFF", bg: "rgba(255,255,255,0.22)" };
  if (value >= 5)
    return { label: "Average", color: "#FFFFFF", bg: "rgba(255,255,255,0.22)" };
  return { label: "Needs improvement", color: "#FFFFFF", bg: "rgba(0,0,0,0.22)" };
}

const NOTIFICATION_DOT: Record<string, string> = {
  PLAN_STATUS: ORANGE,
  MESSAGE: "#2563EB",
  ADVISOR_REQUEST: "#2563EB",
  REMINDER: "#059669",
  WARNING: "#DC2626",
  INFO: "#9CA3AF",
};

const NOTIFICATION_LABEL: Record<string, string> = {
  PLAN_STATUS: "Study plan",
  MESSAGE: "Message",
  ADVISOR_REQUEST: "Advisor",
  REMINDER: "Reminder",
  WARNING: "Warning",
  INFO: "System",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} d ago`;
  return new Date(iso).toLocaleDateString("en-US");
}

export default function HomeScreen() {
  const isDark = useColorScheme() === "dark";

  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
    refetch: refetchProfile,
  } = useMyProfile();
  const { data: progress, refetch: refetchProgress } = useMyProgress();
  const {
    data: advisor,
    isError: advisorError,
    refetch: refetchAdvisor,
  } = useMyAdvisor();
  const { data: notifications, refetch: refetchNotifs } = useNotifications();
  const { data: unreadCount = 0, refetch: refetchUnread } = useUnreadCount();
  const { data: coursesData, refetch: refetchCourses } = useCourses({ size: 6 });
  const courses = useMemo(
    () => coursesData?.pages.flatMap((p) => p) ?? [],
    [coursesData],
  );

  const refreshing = profileLoading;

  const onRefresh = () => {
    refetchProfile();
    refetchProgress();
    refetchAdvisor();
    refetchNotifs();
    refetchUnread();
    refetchCourses();
  };

  const stats = useMemo(() => {
    if (!progress) return null;
    const earned = progress.earnedCredits ?? 0;
    const total = progress.requiredCredits ?? 0;
    const pct =
      total === 0 ? 0 : Math.min(100, Math.round((earned / total) * 100));
    const left = Math.max(0, total - earned);
    return { earned, total, pct, left };
  }, [progress]);

  if (profileLoading || !profile || !stats) {
    return (
      <SafeAreaView
        className="flex-1 bg-ground dark:bg-ground-dark"
        edges={["top"]}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 48 }}
          showsVerticalScrollIndicator={false}
        >
          <HomeSkeleton />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (profileError) {
    return (
      <SafeAreaView
        className="flex-1 bg-ground dark:bg-ground-dark"
        edges={["top"]}
      >
        <View className="mx-5 mt-10 items-center rounded-3xl bg-surface p-8 dark:bg-surface-dark">
          <MaterialCommunityIcons
            name="cloud-off-outline"
            size={40}
            color="#CBD5E1"
          />
          <Text className="mt-3 text-center text-sm text-ink-muted dark:text-ink-muted-dark">
            Could not load your student record. Pull down to try again.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const gpa = profile.currentGpa ?? progress?.currentGpa ?? null;

  return (
    <SafeAreaView
      className="flex-1 bg-ground dark:bg-ground-dark"
      edges={["top"]}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={ORANGE}
          />
        }
      >
        {/* ── 1. Top bar: identity + bell ─────────────────────────── */}
        <View className="flex-row items-center gap-3 px-5 pt-4">
          <View
            className="h-12 w-12 items-center justify-center rounded-full"
            style={{ backgroundColor: ORANGE }}
          >
            <Text className="text-base font-bold text-white">
              {initials(profile.fullName)}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-xs text-ink-faint dark:text-ink-faint-dark">
              {today()}
            </Text>
            <Text
              accessibilityRole="header"
              className="text-[17px] font-bold text-ink dark:text-ink-dark"
              numberOfLines={1}
            >
              {getGreeting()}, {firstName(profile.fullName)}
            </Text>
          </View>
          <NotifBell
            unread={unreadCount}
            onPress={() => router.push("/(app)/notifications")}
          />
        </View>

        {/* ── 2. Hero: the semester at a glance (FPT orange field) ── */}
        <View className="px-5 pt-4">
          <View
            className="overflow-hidden rounded-[28px] p-5"
            style={{ backgroundColor: ORANGE }}
          >
            {/* decorative rings — flat white at low opacity, no gradient */}
            <View
              pointerEvents="none"
              className="absolute -right-16 -top-20 h-52 w-52 rounded-full"
              style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
            />
            <View
              pointerEvents="none"
              className="absolute -bottom-24 -left-10 h-56 w-56 rounded-full"
              style={{ backgroundColor: "rgba(0,0,0,0.08)" }}
            />
            <View
              pointerEvents="none"
              className="absolute right-10 top-24 h-16 w-16 rounded-full border-2"
              style={{ borderColor: "rgba(255,255,255,0.35)" }}
            />

            <View className="flex-row items-center gap-2">
              <View
                className="rounded-full px-3 py-1.5"
                style={{ backgroundColor: "rgba(255,255,255,0.22)" }}
              >
                <Text className="text-[11px] font-bold text-white">
                  Semester {profile.currentSemester ?? "—"} · {profile.cohort ?? "—"}
                </Text>
              </View>
              <View
                className="rounded-full px-3 py-1.5"
                style={{ backgroundColor: gpaRank(gpa).bg }}
              >
                <Text className="text-[11px] font-bold text-white">
                  {gpaRank(gpa).label}
                </Text>
              </View>
            </View>

            <View className="mt-4 flex-row items-end justify-between">
              <View>
                <Text
                  className="text-xs font-medium"
                  style={{ color: "rgba(255,255,255,0.85)" }}
                >
                  Cumulative GPA
                </Text>
                <View className="flex-row items-baseline gap-1">
                  <Text className="text-[52px] font-bold leading-[56px] text-white tabular-nums">
                    {gpa != null ? gpa.toFixed(2) : "—"}
                  </Text>
                  <Text
                    className="text-base font-medium"
                    style={{ color: "rgba(255,255,255,0.8)" }}
                  >
                    / 10
                  </Text>
                </View>
              </View>
              <View className="items-end pb-1">
                <Text className="text-2xl font-bold text-white tabular-nums">
                  {stats.earned}
                  <Text
                    className="text-sm font-medium"
                    style={{ color: "rgba(255,255,255,0.8)" }}
                  >
                    /{stats.total}
                  </Text>
                </Text>
                <Text
                  className="text-[11px] font-medium"
                  style={{ color: "rgba(255,255,255,0.85)" }}
                >
                  credits earned
                </Text>
              </View>
            </View>

            {/* credit track */}
            <View
              className="mt-3 h-2.5 w-full overflow-hidden rounded-full"
              style={{ backgroundColor: "rgba(255,255,255,0.3)" }}
            >
              <View
                className="h-full rounded-full bg-white"
                style={{ width: `${stats.pct}%` }}
              />
            </View>
            <View className="mt-2 flex-row items-center justify-between">
              <Text
                className="text-[11px] font-medium"
                style={{ color: "rgba(255,255,255,0.9)" }}
              >
                {stats.pct}% completed · {stats.left} credits left
              </Text>
              <Text
                className="text-[11px] font-medium"
                style={{ color: "rgba(255,255,255,0.9)" }}
              >
                {profile.studentCode ?? "—"}
              </Text>
            </View>

            <Pressable
              onPress={() => router.push("/(app)/(tabs)/curriculum")}
              accessibilityRole="button"
              accessibilityLabel="View the curriculum"
              className="mt-4 flex-row items-center justify-center gap-2 rounded-2xl bg-white py-3.5 active:opacity-90"
            >
              <MaterialCommunityIcons
                name="book-open-page-variant"
                size={17}
                color={ORANGE_DEEP}
              />
              <Text className="text-sm font-bold" style={{ color: ORANGE_DEEP }}>
                View curriculum
              </Text>
            </Pressable>
          </View>
        </View>

        {/* ── 2b. AI assistant — the core feature, one tap away ─── */}
        <View className="px-5 pt-4">
          <View
            className="overflow-hidden rounded-[28px] border border-line bg-surface dark:border-line-dark dark:bg-surface-dark"
          >
            <View className="flex-row items-center gap-3 px-4 py-3.5">
              <View
                className="h-10 w-10 items-center justify-center rounded-2xl"
                style={{ backgroundColor: ORANGE }}
              >
                <MaterialCommunityIcons name="creation" size={20} color="#fff" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-ink dark:text-ink-dark">
                  AI Academic Assistant
                </Text>
                <Text className="mt-0.5 text-[11px] leading-4 text-ink-muted dark:text-ink-muted-dark">
                  Answers grounded in your curriculum · with citations
                </Text>
              </View>
            </View>

            <View className="flex-row border-t border-rule dark:border-rule-dark">
              <Pressable
                onPress={() => router.push("/(app)/ai-chat")}
                accessibilityRole="button"
                accessibilityLabel="Ask the AI academic assistant"
                className="flex-1 flex-row items-center justify-center gap-2 py-3.5 active:opacity-70"
              >
                <MaterialCommunityIcons
                  name="message-text-outline"
                  size={17}
                  color={ORANGE}
                />
                <Text
                  className="text-[13px] font-bold"
                  style={{ color: ORANGE }}
                >
                  Ask AI
                </Text>
              </Pressable>
              <View className="w-px bg-rule dark:bg-rule-dark" />
              <Pressable
                onPress={() => router.push("/(app)/ai-roadmap")}
                accessibilityRole="button"
                accessibilityLabel="View the AI study roadmap"
                className="flex-1 flex-row items-center justify-center gap-2 py-3.5 active:opacity-70"
              >
                <MaterialCommunityIcons
                  name="map-marker-path"
                  size={17}
                  color={ORANGE}
                />
                <Text
                  className="text-[13px] font-bold"
                  style={{ color: ORANGE }}
                >
                  AI Roadmap
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* ── 3. KPI strip: one card, hairline dividers (no icon tiles) ─ */}
        <View className="px-5 pt-4">
          <View className="flex-row rounded-3xl border border-line bg-surface dark:border-line-dark dark:bg-surface-dark">
            <View className="flex-1 items-center py-4">
              <Text className="text-[11px] font-medium text-ink-muted dark:text-ink-muted-dark">
                Semester
              </Text>
              <Text className="mt-1 text-xl font-bold text-ink tabular-nums dark:text-ink-dark">
                {profile.currentSemester ?? "—"}
              </Text>
            </View>
            <View className="w-px bg-line dark:bg-line-dark" />
            <View className="flex-1 items-center py-4">
              <Text className="text-[11px] font-medium text-ink-muted dark:text-ink-muted-dark">
                Major
              </Text>
              <Text
                className="mt-1 text-[13px] font-bold text-ink dark:text-ink-dark"
                numberOfLines={1}
              >
                {profile.majorCode ?? "—"}
              </Text>
            </View>
            <View className="w-px bg-line dark:bg-line-dark" />
            <View className="flex-1 items-center py-4">
              <Text className="text-[11px] font-medium text-ink-muted dark:text-ink-muted-dark">
                Status
              </Text>
              <View className="mt-1.5 flex-row items-center gap-1.5">
                <View
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: "#059669" }}
                />
                <Text className="text-[13px] font-bold text-ink dark:text-ink-dark">
                  {profile.academicStatus ?? "ACTIVE"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── 4. Quick access — 2 × 2, flat cards, one orange ─────── */}
        <View className="px-5 pt-6">
          <SectionTitle
            title="Quick access"
            action="All"
            onPress={() => router.push("/(app)/(tabs)/courses")}
          />
          <View className="mt-3 flex-row gap-3">
            <QuickCard
              icon="magnify"
              title="Course catalog"
              desc="Code, name, prerequisites"
              onPress={() => router.push("/(app)/(tabs)/courses")}
              featured
            />
            <QuickCard
              icon="school-outline"
              title="Curriculum"
              desc={`${stats.pct}% completed`}
              onPress={() => router.push("/(app)/(tabs)/curriculum")}
            />
          </View>
          <View className="mt-3 flex-row gap-3">
            <QuickCard
              icon="account-outline"
              title="Profile"
              desc={profile.majorName ?? "Student profile"}
              onPress={() => router.push("/(app)/(tabs)/profile")}
            />
            <QuickCard
              icon="calendar-clock"
              title="Book a session"
              desc={advisor ? "Meet your advisor" : "No advisor yet"}
              onPress={() => router.push("/(app)/appointments")}
            />
          </View>

          {/* The student's own editable plan — the one destination that
              only exists for them, so it gets its own full-width card
              instead of a third tile in the grid. */}
          <Pressable
            onPress={() => router.push("/(app)/study-plan")}
            accessibilityRole="button"
            accessibilityLabel="Open my study plan"
            className="mt-3 flex-row items-center gap-3 rounded-3xl border border-line bg-surface p-4 active:opacity-80 dark:border-line-dark dark:bg-surface-dark"
          >
            <View
              className="h-11 w-11 items-center justify-center rounded-2xl"
              style={{ backgroundColor: isDark ? "#2E1C0E" : "#FFF1E7" }}
            >
              <MaterialCommunityIcons
                name="clipboard-text-clock-outline"
                size={22}
                color={isDark ? "#FFA371" : ORANGE}
              />
            </View>

            <View className="flex-1">
              <Text className="text-sm font-bold text-ink dark:text-ink-dark">
                My study plan
              </Text>
              <Text className="mt-0.5 text-[11px] leading-4 text-ink-muted dark:text-ink-muted-dark">
                Edit your semester plan · add or remove courses
              </Text>
            </View>

            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={isDark ? "#A79C93" : "#8B8178"}
            />
          </Pressable>

          {/* Transcript — the official record behind the hero numbers. */}
          <Pressable
            onPress={() => router.push("/(app)/transcript")}
            accessibilityRole="button"
            accessibilityLabel="Open transcript and academic progress"
            className="mt-3 flex-row items-center gap-3 rounded-3xl border border-line bg-surface p-4 active:opacity-80 dark:border-line-dark dark:bg-surface-dark"
          >
            <View
              className="h-11 w-11 items-center justify-center rounded-2xl"
              style={{ backgroundColor: isDark ? "#2E1C0E" : "#FFF1E7" }}
            >
              <MaterialCommunityIcons
                name="file-document-outline"
                size={22}
                color={isDark ? "#FFA371" : ORANGE}
              />
            </View>

            <View className="flex-1">
              <Text className="text-sm font-bold text-ink dark:text-ink-dark">
                Transcript & progress
              </Text>
              <Text className="mt-0.5 text-[11px] leading-4 text-ink-muted dark:text-ink-muted-dark">
                {gpa != null ? `${gpa.toFixed(2)} GPA` : "No GPA yet"} ·{" "}
                {stats.earned}/{stats.total} credits
              </Text>
            </View>

            {profile.academicStatus === "PROBATION" ? (
              <View
                className="rounded-full px-2.5 py-1"
                style={{ backgroundColor: isDark ? "#3A2A0A" : "#FEF3C7" }}
              >
                <Text
                  className="text-[10px] font-bold"
                  style={{ color: isDark ? "#FCD34D" : "#92400E" }}
                >
                  Warning
                </Text>
              </View>
            ) : null}

            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={isDark ? "#A79C93" : "#8B8178"}
            />
          </Pressable>
        </View>

        {/* ── 5. Advisor — the human behind the plan ──────────────── */}
        <View className="px-5 pt-6">
          <SectionTitle title="Your advisor" />
          <View className="mt-3 rounded-3xl border border-line bg-surface p-4 dark:border-line-dark dark:bg-surface-dark">
            {advisorError ? (
              // The advisor could not be fetched — a network/server failure,
              // not "you have no advisor". Offer a retry.
              <View className="flex-row items-center gap-3">
                <MaterialCommunityIcons
                  name="cloud-off-outline"
                  size={24}
                  color="#94A3B8"
                />
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-ink dark:text-ink-dark">
                    Could not load your advisor
                  </Text>
                  <Text className="mt-0.5 text-xs text-ink-muted dark:text-ink-muted-dark">
                    Check your connection and try again.
                  </Text>
                </View>
                <Pressable
                  onPress={() => refetchAdvisor()}
                  hitSlop={8}
                  className="rounded-full bg-raised px-3 py-1.5 active:opacity-70 dark:bg-raised-dark"
                >
                  <Text className="text-xs font-bold text-brand-ink dark:text-brand-ink-dark">
                    Try again
                  </Text>
                </Pressable>
              </View>
            ) : advisor ? (
              <View className="flex-row items-center gap-3">
                <View
                  className="items-center justify-center rounded-full"
                  style={{
                    width: 52,
                    height: 52,
                    backgroundColor: "#FFE5D4",
                  }}
                >
                  <Text
                    className="text-lg font-bold"
                    style={{ color: ORANGE_DEEP }}
                  >
                    {initials(advisor.fullName)}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-[15px] font-bold text-ink dark:text-ink-dark">
                    {advisor.fullName}
                  </Text>
                  <Text
                    className="mt-0.5 text-xs text-ink-muted dark:text-ink-muted-dark"
                    numberOfLines={1}
                  >
                    {advisor.email}
                  </Text>
                  <View className="mt-1.5 self-start rounded-full bg-raised px-2.5 py-1 dark:bg-raised-dark">
                    <Text className="text-[11px] font-semibold text-ink-muted dark:text-ink-muted-dark">
                      {advisor.specialization ?? advisor.groupName ?? "Advisor"}
                    </Text>
                  </View>
                </View>
                <Pressable
                  onPress={() => router.push("/(app)/advising")}
                  accessibilityRole="button"
                  accessibilityLabel={`Chat with ${advisor.fullName}`}
                  className="h-11 w-11 items-center justify-center rounded-full active:opacity-70"
                  style={{ backgroundColor: ORANGE }}
                >
                  <MaterialCommunityIcons
                    name="chat-outline"
                    size={20}
                    color="#fff"
                  />
                </Pressable>
              </View>
            ) : (
              <Text className="text-sm text-ink-muted dark:text-ink-muted-dark">
                You have not been assigned an advisor yet. Contact the Academic
                Office for support.
              </Text>
            )}
          </View>
        </View>

        {/* ── 6. Reminders — latest notifications ─────────────────── */}
        {notifications && notifications.items.length > 0 ? (
          <View className="px-5 pt-6">
            <SectionTitle
              title="Reminders"
              action={`${unreadCount} new`}
              onPress={() => router.push("/(app)/notifications")}
            />
            <View className="mt-3 overflow-hidden rounded-3xl border border-line bg-surface dark:border-line-dark dark:bg-surface-dark">
              {notifications.items.slice(0, 3).map((n, i) => (
                <View key={n.id}>
                  <View className="flex-row items-start gap-3 p-4">
                    <View
                      className="mt-1.5 h-2.5 w-2.5 rounded-full"
                      style={{
                        backgroundColor:
                          NOTIFICATION_DOT[n.notificationType] ?? "#9CA3AF",
                      }}
                    />
                    <View className="flex-1">
                      <View className="flex-row items-center justify-between gap-2">
                        <Text className="flex-1 text-sm font-bold text-ink dark:text-ink-dark">
                          {n.title}
                        </Text>
                        {!n.isRead ? (
                          <View
                            className="rounded-full px-2 py-0.5"
                            style={{ backgroundColor: "#FFF1E7" }}
                          >
                            <Text
                              className="text-[10px] font-bold"
                              style={{ color: ORANGE_DEEP }}
                            >
                              NEW
                            </Text>
                          </View>
                        ) : null}
                      </View>
                      <Text
                        className="mt-1 text-[13px] leading-5 text-ink-muted dark:text-ink-muted-dark"
                        numberOfLines={2}
                      >
                        {n.message}
                      </Text>
                      <Text className="mt-1.5 text-[11px] text-ink-faint dark:text-ink-faint-dark">
                        {NOTIFICATION_LABEL[n.notificationType] ??
                          n.notificationType}{" "}
                        · {timeAgo(n.createdAt)}
                      </Text>
                    </View>
                  </View>
                  {i < Math.min(2, notifications.items.length - 1) && (
                    <View className="ml-[30px] h-px bg-rule dark:bg-rule-dark" />
                  )}
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* ── 7. Course catalog preview ───────────────────────────── */}
        {courses && courses.length > 0 ? (
          <View className="pt-6">
            <View className="px-5">
              <SectionTitle
                title="Course catalog"
                action="Browse"
                onPress={() => router.push("/(app)/(tabs)/courses")}
              />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingTop: 12,
                gap: 12,
              }}
            >
              {courses.slice(0, 6).map((c) => (
                <Pressable
                  key={c.id}
                  onPress={() => router.push("/(app)/(tabs)/courses")}
                  className="w-[200px] rounded-3xl border border-line bg-surface p-4 active:opacity-90 dark:border-line-dark dark:bg-surface-dark"
                >
                  <View className="flex-row items-center justify-between">
                    <Text
                      className="text-[11px] font-bold tracking-wide"
                      style={{ color: ORANGE_DEEP }}
                    >
                      {c.code}
                    </Text>
                    <View className="rounded-full bg-raised px-2 py-0.5 dark:bg-raised-dark">
                      <Text className="text-[10px] font-bold text-ink-muted dark:text-ink-muted-dark">
                        {c.credits} cr
                      </Text>
                    </View>
                  </View>
                  <Text
                    className="mt-2 min-h-[40px] text-sm font-bold leading-5 text-ink dark:text-ink-dark"
                    numberOfLines={2}
                  >
                    {c.name}
                  </Text>
                  <View className="mt-3 flex-row items-center gap-1">
                    <MaterialCommunityIcons
                      name="arrow-right"
                      size={14}
                      color={ORANGE}
                    />
                    <Text className="text-xs font-semibold" style={{ color: ORANGE }}>
                      View details
                    </Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ) : null}

        {/* ── 8. Study meta ──────────────────────────────────────── */}
        <View className="mx-5 mt-6 rounded-3xl bg-raised p-4 dark:bg-raised-dark">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-semibold text-ink-muted dark:text-ink-muted-dark">
              {profile.majorName ?? "FAAPS"}
            </Text>
            <Text className="text-xs text-ink-faint dark:text-ink-faint-dark">
              {profile.cohort ?? ""}
            </Text>
          </View>
          <View className="mt-3">
            <Progress value={stats.pct} color="primary" />
          </View>
          <Text className="mt-2 text-center text-[11px] text-ink-faint dark:text-ink-faint-dark">
            FAAPS · FPT University HCMC — walking with you to graduation
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Pieces ────────────────────────────────────────────────────────────────

function NotifBell({
  unread,
  onPress,
}: {
  unread: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={
        unread > 0 ? `Notifications, ${unread} unread` : "Notifications"
      }
      className="relative h-11 w-11 items-center justify-center rounded-full border border-line bg-surface active:opacity-70 dark:border-line-dark dark:bg-surface-dark"
    >
      <MaterialCommunityIcons name="bell-outline" size={20} color="#191512" />
      {unread > 0 && (
        <View
          className="absolute -right-0.5 -top-0.5 min-h-[20px] min-w-[20px] items-center justify-center rounded-full border-2 border-white px-1"
          style={{ backgroundColor: ORANGE }}
        >
          <Text className="text-[10px] font-bold text-white tabular-nums">
            {unread > 9 ? "9+" : unread}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

function SectionTitle({
  title,
  action,
  onPress,
}: {
  title: string;
  action?: string;
  onPress?: () => void;
}) {
  return (
    <View className="flex-row items-end justify-between">
      <Text className="text-[15px] font-bold text-ink dark:text-ink-dark">
        {title}
      </Text>
      {action ? (
        <Pressable onPress={onPress} hitSlop={10}>
          <Text className="text-xs font-bold" style={{ color: ORANGE }}>
            {action}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function QuickCard({
  icon,
  title,
  desc,
  onPress,
  featured,
}: {
  icon: string;
  title: string;
  desc: string;
  onPress: () => void;
  featured?: boolean;
}) {
  // The featured card wears the brand's deep orange — never a black slab.
  // It reads as the primary action against its white neighbour while
  // staying inside the page's orange / white / warm-paper family.
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const featuredBg = isDark ? "#C25510" : "#D85A11";
  const featuredBorder = isDark ? "#C25510" : "#D85A11";

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="flex-1 rounded-3xl border p-4 active:opacity-90"
      style={
        featured
          ? {
              backgroundColor: featuredBg,
              borderColor: featuredBorder,
            }
          : {
              backgroundColor: "#FFFFFF",
              borderColor: "#EAE1D8",
            }
      }
    >
      <MaterialCommunityIcons
        name={icon as any}
        size={22}
        color={featured ? "#FFFFFF" : ORANGE}
      />
      <Text
        className="mt-3 text-sm font-bold"
        style={{ color: featured ? "#FFFFFF" : "#191512" }}
      >
        {title}
      </Text>
      <Text
        className="mt-0.5 text-[11px]"
        style={{ color: featured ? "rgba(255,255,255,0.82)" : "#6A6058" }}
        numberOfLines={1}
      >
        {desc}
      </Text>
      <View className="mt-3 flex-row items-center gap-1">
        <Text
          className="text-[11px] font-bold"
          style={{ color: featured ? "#FFFFFF" : ORANGE }}
        >
          Open
        </Text>
        <MaterialCommunityIcons
          name="chevron-right"
          size={14}
          color={featured ? "#FFFFFF" : ORANGE}
        />
      </View>
    </Pressable>
  );
}

function HomeSkeleton() {
  return (
    <View className="px-5 pt-4">
      <View className="flex-row items-center gap-3">
        <Skeleton width={48} height={48} className="rounded-full" />
        <View className="flex-1 gap-2">
          <Skeleton width="40%" height={12} />
          <Skeleton width="70%" height={18} />
        </View>
        <Skeleton width={44} height={44} className="rounded-full" />
      </View>
      <Skeleton height={280} className="mt-4 rounded-[28px]" />
      <View className="mt-4 flex-row gap-3">
        <Skeleton height={86} className="flex-1 rounded-3xl" />
        <Skeleton height={86} className="flex-1 rounded-3xl" />
      </View>
      <Skeleton width="45%" height={18} className="mt-6" />
      <View className="mt-3 flex-row gap-3">
        <Skeleton height={130} className="flex-1 rounded-3xl" />
        <Skeleton height={130} className="flex-1 rounded-3xl" />
      </View>
      <View className="mt-6 items-center">
        <ActivityIndicator color={ORANGE} />
      </View>
    </View>
  );
}
