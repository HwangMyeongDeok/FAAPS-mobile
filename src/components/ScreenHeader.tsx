import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, Text, useColorScheme, View } from "react-native";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  /** Renders a back chevron that pops the current screen. */
  onBack?: () => void;
  /**
   * Which palette the header wears.
   *
   * • "framed" (default) — the current FAAPS warm-paper theme: warm ground
   *   surfaces, warm hairlines, dark-mode aware. Used by every screen
   *   rebuilt on the new design language.
   * • "legacy" — the original shadcn/slate palette, kept for the three tabs
   *   that have not been restyled yet.
   */
  variant?: "framed" | "legacy";
}

export function ScreenHeader({
  title,
  subtitle,
  right,
  onBack,
  variant = "framed",
}: ScreenHeaderProps) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const framed = variant === "framed";

  // Legacy headers keep the slate palette; framed ones follow the warm ink.
  const chevronColor = framed
    ? isDark
      ? "#F7F2EC"
      : "#191512"
    : isDark
      ? "#F8FAFC"
      : "#0F172A";
  const titleColor = framed
    ? isDark
      ? "#F7F2EC"
      : "#191512"
    : isDark
      ? "#FFFFFF"
      : "#0F172A";
  const subtitleColor = framed
    ? isDark
      ? "#A79C93"
      : "#6A6058"
    : isDark
      ? "#94A3B8"
      : "#64748B";

  return (
    <View
      className={framed
        ? "border-b border-line bg-surface px-5 pt-4 pb-4 dark:border-line-dark dark:bg-surface-dark"
        : "bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-5 pt-4 pb-4"}
    >
      <View className="flex-row items-center justify-between">
        {onBack ? (
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Quay lại"
            hitSlop={10}
            className="-ml-2 mr-1 h-10 w-10 items-center justify-center rounded-full active:bg-slate-100 dark:active:bg-slate-800"
          >
            <MaterialCommunityIcons name="chevron-left" size={26} color={chevronColor} />
          </Pressable>
        ) : null}

        <View className="flex-1 pr-3">
          <Text className="text-2xl font-bold" style={{ color: titleColor }}>
            {title}
          </Text>
          {subtitle ? (
            <Text className="mt-1 text-sm" style={{ color: subtitleColor }}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {right}
      </View>
    </View>
  );
}

/**
 * Shared helper so every pushed screen pops the same way.
 * `/(app)/(tabs)` is the home tab — the fallback when there is no history
 * (for example when the screen was opened from a deep link).
 */
export function goBack() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace("/(app)/(tabs)");
  }
}
