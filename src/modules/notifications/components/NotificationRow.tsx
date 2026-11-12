import { Pressable, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";

import { resolveServerRoute } from "@/lib/navigation";
import type { AppNotification } from "@/types";
import { KIND_DOT, KIND_LABEL, ORANGE_DEEP, timeAgo } from "../format";

interface NotificationRowProps {
  item: AppNotification;
  tint: string;
  tintInk: string;
  dotRead: string;
  chevron: string;
  onUnreadTap: (n: AppNotification) => void;
  onBadLink: () => void;
}

/**
 * One notification row: unread dot + title + message + kind/time.
 * A tap clears the unread state and follows the deep link when the link
 * points at a route this app actually has.
 */
export function NotificationRow({
  item,
  tint,
  tintInk,
  dotRead,
  chevron,
  onUnreadTap,
  onBadLink,
}: NotificationRowProps) {
  const onPress = () => {
    if (!item.isRead) onUnreadTap(item);

    const resolution = resolveServerRoute(item.actionUrl);
    if (!resolution.ok) {
      if (resolution.reason === "unsupported") {
        console.warn(
          `[FAAPS] Ignoring an unsupported notification link: ${resolution.url}`,
        );
        onBadLink();
      }
      return;
    }
    if (resolution.href.startsWith("/(app)/notifications")) return;
    try {
      router.push(resolution.href);
    } catch (error) {
      console.warn(
        `[FAAPS] Could not open the notification link "${resolution.href}"`,
        error,
      );
      onBadLink();
    }
  };

  const navigable = (() => {
    const r = resolveServerRoute(item.actionUrl);
    if (!r.ok) return false;
    return !r.href.startsWith("/(app)/notifications");
  })();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}. ${item.message}`}
      className="flex-row items-start gap-3 py-4 active:opacity-70"
    >
      <View
        className="mt-1.5 h-2.5 w-2.5 rounded-full"
        style={{
          backgroundColor: item.isRead ? dotRead : (KIND_DOT[item.notificationType] ?? "#9CA3AF"),
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
            <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: tint }}>
              <Text className="text-[10px] font-bold" style={{ color: tintInk }}>
                NEW
              </Text>
            </View>
          )}
        </View>
        <Text className="mt-1 text-[13px] leading-5 text-ink-muted dark:text-ink-muted-dark">
          {item.message}
        </Text>
        <Text className="mt-1.5 text-[11px] text-ink-faint dark:text-ink-faint-dark">
          {KIND_LABEL[item.notificationType] ?? item.notificationType} · {timeAgo(item.createdAt)}
        </Text>
      </View>
      {item.actionUrl && navigable ? (
        <MaterialCommunityIcons name="chevron-right" size={20} color={chevron} style={{ marginTop: 2 }} />
      ) : null}
    </Pressable>
  );
}

/** Shared tint for the empty icon — keeps dark/light in one place. */
export function emptyTint(isDark: boolean): string {
  void ORANGE_DEEP;
  return isDark ? "#241F1B" : "#F2EDE7";
}
