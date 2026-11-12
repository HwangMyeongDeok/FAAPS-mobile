import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { cardShadow } from "@/lib/shadow";
import type { StudentAdvisor } from "@/types";
import { ORANGE, ORANGE_DEEP, initials } from "../format";

interface AdvisorStripProps {
  advisor?: StudentAdvisor | null;
  loading: boolean;
  error: boolean;
  /** True only when the request succeeded and the student really has none. */
  hasNoAdvisor: boolean;
  isDark: boolean;
  onRetry: () => void;
}

/**
 * Who the student is booking with: the advisor card, its loading state,
 * its error state with a retry, and the "no advisor yet" notice that
 * explains why booking is blocked.
 */
export function AdvisorStrip({
  advisor,
  loading,
  error,
  hasNoAdvisor,
  isDark,
  onRetry,
}: AdvisorStripProps) {
  return (
    <View className="px-5 pt-4">
      {error ? (
        // The advisor could not be loaded — a network/server failure, so
        // the student gets a retry instead of a silent "no advisor" state.
        <View
          className="flex-row items-center gap-3 rounded-3xl border border-line bg-surface p-4 dark:border-line-dark dark:bg-surface-dark"
          style={cardShadow(isDark)}
        >
          <MaterialCommunityIcons
            name="cloud-off-outline"
            size={26}
            color="#94A3B8"
          />
          <View className="flex-1">
            <Text className="text-[15px] font-bold text-ink dark:text-ink-dark">
              Could not load your advisor
            </Text>
            <Text className="mt-0.5 text-xs text-ink-muted dark:text-ink-muted-dark">
              Check your connection and try again.
            </Text>
          </View>
          <Pressable
            onPress={onRetry}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Retry loading your advisor"
            className="rounded-full px-3 py-1.5 active:opacity-80"
            style={{ backgroundColor: isDark ? "#2E1C0E" : "#FFF1E7" }}
          >
            <Text
              className="text-xs font-bold"
              style={{ color: isDark ? "#FFA371" : ORANGE_DEEP }}
            >
              Try again
            </Text>
          </Pressable>
        </View>
      ) : loading ? (
        <View
          className="flex-row items-center gap-3 rounded-3xl border border-line bg-surface p-4 dark:border-line-dark dark:bg-surface-dark"
          style={cardShadow(isDark)}
        >
          <ActivityIndicator color={ORANGE} />
          <Text className="text-sm text-ink-muted dark:text-ink-muted-dark">
            Loading your advisor…
          </Text>
        </View>
      ) : (
        <View
          className="flex-row items-center gap-3 rounded-3xl border border-line bg-surface p-4 dark:border-line-dark dark:bg-surface-dark"
          style={cardShadow(isDark)}
        >
          <View
            className="items-center justify-center rounded-full"
            style={{
              width: 52,
              height: 52,
              backgroundColor: isDark ? "#2E1C0E" : "#FFE5D4",
            }}
          >
            <Text
              className="text-lg font-bold"
              style={{ color: isDark ? "#FFA371" : ORANGE_DEEP }}
            >
              {advisor ? initials(advisor.fullName) : "AD"}
            </Text>
          </View>
          <View className="flex-1">
            <Text
              className="text-[15px] font-bold text-ink dark:text-ink-dark"
              numberOfLines={1}
            >
              {advisor?.fullName ?? "Your advisor"}
            </Text>
            <Text
              className="mt-0.5 text-xs text-ink-muted dark:text-ink-muted-dark"
              numberOfLines={1}
            >
              {advisor?.email ?? "Contact the Academic Office to get an advisor"}
            </Text>
            {advisor?.specialization ? (
              <View className="mt-1.5 flex-row items-center gap-1">
                <MaterialCommunityIcons
                  name="briefcase-outline"
                  size={13}
                  color={ORANGE}
                />
                <Text className="text-[11px] font-semibold text-ink-muted dark:text-ink-muted-dark">
                  {advisor.specialization}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      )}

      {/* No advisor yet — booking is blocked, so say it up front. */}
      {hasNoAdvisor ? (
        <View
          className="mt-3 flex-row items-start gap-2.5 rounded-2xl px-3.5 py-3"
          style={{ backgroundColor: isDark ? "#3A2A10" : "#FFF4E6" }}
        >
          <MaterialCommunityIcons
            name="account-alert-outline"
            size={18}
            color={ORANGE}
          />
          <Text
            className="flex-1 text-xs leading-4"
            style={{ color: isDark ? "#FFD9B8" : "#8A4B12" }}
          >
            You don&apos;t have an assigned advisor yet. Please contact the
            admin.
          </Text>
        </View>
      ) : null}
    </View>
  );
}
