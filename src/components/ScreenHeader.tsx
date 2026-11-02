import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, Text, useColorScheme, View } from "react-native";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  /** Renders a back chevron that pops the current screen. */
  onBack?: () => void;
}

export function ScreenHeader({ title, subtitle, right, onBack }: ScreenHeaderProps) {
  const scheme = useColorScheme();
  const chevronColor = scheme === "dark" ? "#F8FAFC" : "#0F172A";

  return (
    <View className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-5 pt-4 pb-4">
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
          <Text className="text-2xl font-bold text-slate-900 dark:text-white">
            {title}
          </Text>
          {subtitle ? (
            <Text className="mt-1 text-sm text-slate-500">{subtitle}</Text>
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
