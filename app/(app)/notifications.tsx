/**
 * FE-S-9 — In-app notification centre.
 *
 * The screen answers one question: "Is there anything new I need to read?"
 * It is a list to work through, so it stays quiet: flat rows on the warm
 * paper ground, one orange accent reserved for the unread state and the
 * single primary action ("Mark all read").
 */

import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";

import { ScreenHeader, goBack } from "@/components/ScreenHeader";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/lib/queries/notifications";
import type { AppNotification } from "@/types";

const ORANGE = "#F36F21";
const ORANGE_DEEP = "#B5460D";

const KIND_LABEL: Record<string, string> = {
  PLAN_STATUS: "Study plan",
  MESSAGE: "Message",
  ADVISOR_REQUEST: "Advisor",
  REMINDER: "Reminder",
  WARNING: "Warning",
  INFO: "System",
};

const KIND_DOT: Record<string, string> = {
  PLAN_STATUS: ORANGE,
  MESSAGE: "#2563EB",
  ADVISOR_REQUEST: "#2563EB",
  REMINDER: "#059669",
  WARNING: "#DC2626",
  INFO: "#9CA3AF",
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

type Filter = "all" | "unread";

export default function NotificationsScreen() {
  const { data, isLoading, isError, isRefetching, refetch } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const [filter, setFilter] = useState<Filter>("all");
  const isDark = useColorScheme() === "dark";

  // The warm-paper palette needs a darker echo of itself for dark mode.
  const tint = isDark ? "#2E1C0E" : "#FFF1E7";
  const tintInk = isDark ? "#FFA371" : ORANGE_DEEP;
  const dotRead = isDark ? "#4A423B" : "#D6CCC3";
  const chevron = isDark ? "#4A423B" : "#C3B8AD";

  const notifications = useMemo(() => data?.items ?? [], [data]);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const visible = useMemo(
    () =>
      filter === "unread"
        ? notifications.filter((n) => !n.isRead)
        : notifications,
    [filter, notifications],
  );

  /**
   * A tap does two things: it clears the unread state and it follows the
   * deep link the notification carries, when that link points at a route
   * this app actually has.
   */
  const onPress = (n: AppNotification) => {
    if (!n.isRead) markRead.mutate(n.id);
    const href = n.actionUrl;
    if (!href) return;
    // A link back to this screen would be a no-op — leave the user in place.
    if (href.startsWith("/(app)/notifications")) return;
    router.push(href as never);
  };

  return (
    <SafeAreaView
      className="flex-1 bg-ground dark:bg-ground-dark"
      edges={["top"]}
    >
      <ScreenHeader
        title="Notifications"
        subtitle={
          unreadCount > 0
            ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
            : "You are all caught up"
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

      {/* Filter — one row of chips, the list starts right under it */}
      <View className="flex-row gap-2 px-5 pt-4">
        <FilterChip
          label="All"
          count={notifications.length}
          active={filter === "all"}
          onPress={() => setFilter("all")}
        />
        <FilterChip
          label="Unread"
          count={unreadCount}
          active={filter === "unread"}
          onPress={() => setFilter("unread")}
        />
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={ORANGE} />
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center px-8">
          <MaterialCommunityIcons
            name="cloud-off-outline"
            size={40}
            color="#CBD5E1"
          />
          <Text className="mt-3 text-center text-sm text-ink-muted dark:text-ink-muted-dark">
            Could not load your notifications. Pull down to try again.
          </Text>
        </View>
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(n) => n.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 48 }}
          ItemSeparatorComponent={() => (
            <View className="h-px bg-rule dark:bg-rule-dark" />
          )}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => {
                void refetch();
              }}
              tintColor={ORANGE}
            />
          }
          ListEmptyComponent={
            <View className="items-center px-8 pt-16">
              <View
                className="h-14 w-14 items-center justify-center rounded-full"
                style={{ backgroundColor: isDark ? "#241F1B" : "#F2EDE7" }}
              >
                <MaterialCommunityIcons
                  name="bell-check-outline"
                  size={26}
                  color={tintInk}
                />
              </View>
              <Text className="mt-4 text-center text-sm font-semibold text-ink dark:text-ink-dark">
                {filter === "unread"
                  ? "No unread notifications"
                  : "No notifications yet"}
              </Text>
              <Text className="mt-1 text-center text-xs text-ink-muted dark:text-ink-muted-dark">
                When your advisor replies or a study plan is updated, it shows
                up here.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => onPress(item)}
              accessibilityRole="button"
              accessibilityLabel={`${item.title}. ${item.message}`}
              className="flex-row items-start gap-3 py-4 active:opacity-70"
            >
              <View
                className="mt-1.5 h-2.5 w-2.5 rounded-full"
                style={{
                  backgroundColor: item.isRead
                    ? dotRead
                    : (KIND_DOT[item.notificationType] ?? "#9CA3AF"),
                }}
              />
              <View className="flex-1">
                <View className="flex-row items-start justify-between gap-3">
                  <Text
                    className="flex-1 text-[15px] leading-5 text-ink dark:text-ink-dark"
                    style={item.isRead ? undefined : { fontWeight: "700" }}
                  >
                    {item.title}
                  </Text>
                  {!item.isRead && (
                    <View
                      className="rounded-full px-2 py-0.5"
                      style={{ backgroundColor: tint }}
                    >
                      <Text
                        className="text-[10px] font-bold"
                        style={{ color: tintInk }}
                      >
                        NEW
                      </Text>
                    </View>
                  )}
                </View>
                <Text className="mt-1 text-[13px] leading-5 text-ink-muted dark:text-ink-muted-dark">
                  {item.message}
                </Text>
                <Text className="mt-1.5 text-[11px] text-ink-faint dark:text-ink-faint-dark">
                  {KIND_LABEL[item.notificationType] ?? item.notificationType} ·{" "}
                  {timeAgo(item.createdAt)}
                </Text>
              </View>
              {item.actionUrl &&
              !item.actionUrl.startsWith("/(app)/notifications") ? (
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color={chevron}
                  style={{ marginTop: 2 }}
                />
              ) : null}
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

function FilterChip({
  label,
  count,
  active,
  onPress,
}: {
  label: string;
  count: number;
  active: boolean;
  onPress: () => void;
}) {
  const isDark = useColorScheme() === "dark";
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      className="flex-row items-center gap-1.5 rounded-full px-3.5 py-2 active:opacity-70"
      style={
        active
          ? { backgroundColor: ORANGE }
          : {
              backgroundColor: "transparent",
              borderWidth: 1,
              borderColor: isDark ? "#302A24" : "#EAE1D8",
            }
      }
    >
      <Text
        className="text-xs font-bold"
        style={{
          color: active ? "#FFFFFF" : isDark ? "#A79C93" : "#6A6058",
        }}
      >
        {label}
      </Text>
      <Text
        className="text-xs font-semibold tabular-nums"
        style={{
          color: active ? "rgba(255,255,255,0.8)" : isDark ? "#7D746C" : "#8B8178",
        }}
      >
        {count}
      </Text>
    </Pressable>
  );
}
