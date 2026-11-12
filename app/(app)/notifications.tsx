/**
 * FE-S-9 — In-app notification centre.
 * Container keeps data hooks; visuals live in `src/modules/notifications/`.
 */

import { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, RefreshControl, Text, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenHeader, goBack } from "@/components/ScreenHeader";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "@/components/feedback";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/lib/queries/notifications";
import { ORANGE, ORANGE_DEEP, type NotificationFilter } from "@/modules/notifications/format";
import { FilterChip } from "@/modules/notifications/components/FilterChip";
import { NotificationRow } from "@/modules/notifications/components/NotificationRow";
import type { AppNotification } from "@/types";

export default function NotificationsScreen() {
  const { data, isLoading, isError, isRefetching, refetch } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const [toast, setToast] = useState<string | null>(null);
  const isDark = useColorScheme() === "dark";

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  const tint = isDark ? "#2E1C0E" : "#FFF1E7";
  const tintInk = isDark ? "#FFA371" : ORANGE_DEEP;
  const dotRead = isDark ? "#4A423B" : "#D6CCC3";
  const chevron = isDark ? "#4A423B" : "#C3B8AD";

  const notifications = useMemo(() => data?.items ?? [], [data]);
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const visible = useMemo(
    () => (filter === "unread" ? notifications.filter((n) => !n.isRead) : notifications),
    [filter, notifications],
  );

  const onUnreadTap = (n: AppNotification) => markRead.mutate(n.id);

  return (
    <SafeAreaView className="flex-1 bg-ground dark:bg-ground-dark" edges={["top"]}>
      <ScreenHeader
        title="Notifications"
        subtitle={
          unreadCount > 0 ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}` : "You are all caught up"
        }
        onBack={goBack}
        right={
          unreadCount > 0 ? (
            <Pressable
              onPress={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
              accessibilityRole="button"
              hitSlop={8}
              className="rounded-full px-3 py-2 active:opacity-70"
              style={{ backgroundColor: tint }}
            >
              <Text className="text-xs font-bold" style={{ color: tintInk }}>
                Mark all read
              </Text>
            </Pressable>
          ) : null
        }
      />

      <View className="flex-row gap-2 px-5 pt-4">
        <FilterChip label="All" count={notifications.length} active={filter === "all"} onPress={() => setFilter("all")} />
        <FilterChip label="Unread" count={unreadCount} active={filter === "unread"} onPress={() => setFilter("unread")} />
      </View>

      {isLoading ? (
        <View className="flex-1 px-5 pt-4">
          <LoadingBlock message="Loading notifications…" />
        </View>
      ) : isError ? (
        <View className="flex-1 px-5 pt-4">
          <ErrorBlock
            title="Could not load notifications"
            message="Check your connection and try again."
            onRetry={() => refetch()}
          />
        </View>
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(n) => n.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 48 }}
          ItemSeparatorComponent={() => <View className="h-px bg-rule dark:bg-rule-dark" />}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={() => { void refetch(); }} tintColor={ORANGE} />
          }
          ListEmptyComponent={
            <EmptyBlock
              icon="bell-check-outline"
              title={filter === "unread" ? "No unread notifications" : "No notifications yet"}
              message="When your advisor replies or a study plan is updated, it shows up here."
            />
          }
          renderItem={({ item }) => (
            <NotificationRow
              item={item}
              tint={tint}
              tintInk={tintInk}
              dotRead={dotRead}
              chevron={chevron}
              onUnreadTap={onUnreadTap}
              onBadLink={() => setToast("That notification link is not available in the app.")}
            />
          )}
        />
      )}

      {toast ? (
        <View className="absolute bottom-6 left-5 right-5 items-center" pointerEvents="none">
          <View className="rounded-full px-4 py-2.5" style={{ backgroundColor: isDark ? "#1B1815" : "#191512" }}>
            <Text className="text-xs font-semibold text-white">{toast}</Text>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}
