/**
 * FE-S-1 — Home dashboard: "Where do I stand right now?"
 * Container keeps data hooks; visuals live in `src/modules/home/`.
 */
import { useMemo } from "react";
import { RefreshControl, ScrollView, Text, View, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";

import { ErrorBlock } from "@/components/feedback";
import { useMyAdvisor, useMyProfile, useMyProgress } from "@/lib/queries/profile";
import { useNotifications, useUnreadCount } from "@/lib/queries/notifications";
import { useCourses } from "@/lib/queries/course";
import { ORANGE } from "@/modules/home/format";
import { HomeSkeleton } from "@/modules/home/components/common";
import {
  AdvisorSection,
  AiEntryCard,
  CatalogPreview,
  HomeHero,
  HomeTopBar,
  KpiStrip,
  QuickAccess,
  RemindersSection,
  StudyMetaFooter,
} from "@/modules/home/components/sections";

export default function HomeScreen() {
  const isDark = useColorScheme() === "dark";
  const { data: profile, isLoading: profileLoading, isError: profileError, refetch: refetchProfile } = useMyProfile();
  const { data: progress, refetch: refetchProgress } = useMyProgress();
  const { data: advisor, isError: advisorError, refetch: refetchAdvisor } = useMyAdvisor();
  const { data: notifications, refetch: refetchNotifs } = useNotifications();
  const { data: unreadCount = 0, refetch: refetchUnread } = useUnreadCount();
  const { data: coursesData, refetch: refetchCourses } = useCourses({ size: 6 });
  const courses = useMemo(() => coursesData?.pages.flatMap((p) => p) ?? [], [coursesData]);

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
    const pct = total === 0 ? 0 : Math.min(100, Math.round((earned / total) * 100));
    return { earned, total, pct, left: Math.max(0, total - earned) };
  }, [progress]);

  if (profileLoading || !profile || !stats) {
    return (
      <SafeAreaView className="flex-1 bg-ground dark:bg-ground-dark" edges={["top"]}>
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
          <HomeSkeleton />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (profileError) {
    return (
      <SafeAreaView className="flex-1 bg-ground dark:bg-ground-dark" edges={["top"]}>
        <View className="flex-1 px-5 pt-10">
          <ErrorBlock
            title="Could not load your record"
            message="Check your connection and pull down to try again."
            onRetry={() => refetchProfile()}
          />
        </View>
      </SafeAreaView>
    );
  }

  const gpa = profile.currentGpa ?? progress?.currentGpa ?? null;

  return (
    <SafeAreaView className="flex-1 bg-ground dark:bg-ground-dark" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ORANGE} />}
      >
        <HomeTopBar profile={profile} unreadCount={unreadCount} onNotif={() => router.push("/(app)/notifications")} />
        <HomeHero profile={profile} gpa={gpa} stats={stats} />
        <AiEntryCard />
        <KpiStrip profile={profile} />
        <QuickAccess stats={stats} advisor={advisor} profile={profile} gpa={gpa} isDark={isDark} />
        <AdvisorSection advisor={advisor} advisorError={advisorError} isDark={isDark} onRetry={() => refetchAdvisor()} />
        <RemindersSection notifications={notifications} unreadCount={unreadCount} />
        <CatalogPreview courses={courses} />
        <StudyMetaFooter profile={profile} progress={progress} stats={stats} />

        <View className="mt-4 flex-row items-center justify-center gap-1.5 px-5">
          <MaterialCommunityIcons name="shield-check-outline" size={12} color={isDark ? "#7D746C" : "#8B8178"} />
          <Text className="text-[11px] text-ink-faint dark:text-ink-faint-dark">
            Data from the FAAPS student portal · refreshed on pull
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
