import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const ORANGE = "#F36F21";

interface ErrorBlockProps {
  title: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

/**
 * The standard failure state for one block (never a full-screen banner).
 * One sentence saying what failed, and a Retry text button.
 */
export function ErrorBlock({
  title,
  message,
  onRetry,
  retryLabel = "Try again",
}: ErrorBlockProps) {
  return (
    <View className="items-center rounded-3xl border border-line bg-surface px-6 py-8 dark:border-line-dark dark:bg-surface-dark">
      <MaterialCommunityIcons
        name="cloud-off-outline"
        size={32}
        color="#94A3B8"
      />
      <Text className="mt-2 text-sm font-bold text-ink dark:text-ink-dark">
        {title}
      </Text>
      <Text className="mt-1 text-center text-xs leading-4 text-ink-muted dark:text-ink-muted-dark">
        {message}
      </Text>
      {onRetry ? (
        <Pressable
          onPress={onRetry}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={retryLabel}
          className="mt-3 rounded-full px-4 py-2 active:opacity-80"
          style={{ backgroundColor: ORANGE }}
        >
          <Text className="text-xs font-bold text-white">{retryLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

interface EmptyBlockProps {
  icon: string;
  iconColor?: string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * The standard empty state: icon, title, one sentence, optional action.
 * The frame stays — only the content says "nothing here yet".
 */
export function EmptyBlock({
  icon,
  iconColor = ORANGE,
  title,
  message,
  actionLabel,
  onAction,
}: EmptyBlockProps) {
  return (
    <View className="items-center rounded-3xl border border-line bg-surface px-6 py-8 dark:border-line-dark dark:bg-surface-dark">
      <View
        className="h-12 w-12 items-center justify-center rounded-full"
        style={{ backgroundColor: "#FFE5D4" }}
      >
        <MaterialCommunityIcons name={icon as never} size={24} color={iconColor} />
      </View>
      <Text className="mt-3 text-sm font-bold text-ink dark:text-ink-dark">
        {title}
      </Text>
      <Text className="mt-1 text-center text-xs leading-4 text-ink-muted dark:text-ink-muted-dark">
        {message}
      </Text>
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          className="mt-4 rounded-full px-5 py-2.5 active:opacity-85"
          style={{ backgroundColor: ORANGE }}
        >
          <Text className="text-xs font-bold text-white">{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/** Inline loading that keeps the block's frame and pitch. */
export function LoadingBlock({ message }: { message?: string }) {
  return (
    <View className="items-center rounded-3xl border border-line bg-surface py-10 dark:border-line-dark dark:bg-surface-dark">
      <ActivityIndicator color={ORANGE} />
      {message ? (
        <Text className="mt-2 text-xs text-ink-muted dark:text-ink-muted-dark">
          {message}
        </Text>
      ) : null}
    </View>
  );
}
