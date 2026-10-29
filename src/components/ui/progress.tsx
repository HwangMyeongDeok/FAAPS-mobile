import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { Animated, View } from "react-native";

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  color?: "primary" | "success" | "warning" | "destructive";
}

const colorMap = {
  primary:    "bg-primary",
  success:    "bg-emerald-500",
  warning:    "bg-amber-500",
  destructive:"bg-destructive",
};

export function Progress({ value = 0, max = 100, className, color = "primary" }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, (value / max) * 100));
  // `useState` (not `useRef`) so the Animated.Value is a plain value rather than
  // a ref — reading it during render is then legal (react-hooks/refs).
  const [widthAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: clamped,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [clamped, widthAnim]);

  // Interpolate outside of render so no ref is accessed while rendering.
  const width = useMemo(
    () =>
      widthAnim.interpolate({
        inputRange: [0, 100],
        outputRange: ["0%", "100%"],
      }),
    [widthAnim],
  );

  return (
    <View className={cn("h-2 w-full overflow-hidden rounded-full bg-secondary", className)}>
      <Animated.View
        className={cn("h-full rounded-full", colorMap[color])}
        style={{ width }}
      />
    </View>
  );
}
