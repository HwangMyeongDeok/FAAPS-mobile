import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { Animated, Pressable } from "react-native";

interface SwitchProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Switch({ checked = false, onCheckedChange, disabled, className }: SwitchProps) {
  // `useState` (not `useRef`) so the Animated.Value is a plain value rather than
  // a ref — reading it during render is then legal (react-hooks/refs).
  const [anim] = useState(() => new Animated.Value(checked ? 1 : 0));

  useEffect(() => {
    Animated.spring(anim, {
      toValue: checked ? 1 : 0,
      friction: 6,
      useNativeDriver: true,
    }).start();
  }, [checked, anim]);

  // Interpolate outside of render so no ref is accessed while rendering.
  const translateX = useMemo(
    () => anim.interpolate({ inputRange: [0, 1], outputRange: [0, 20] }),
    [anim],
  );

  return (
    <Pressable
      onPress={() => !disabled && onCheckedChange?.(!checked)}
      accessibilityRole="switch"
      accessibilityState={{ checked, disabled }}
      className={cn(
        "h-6 w-11 shrink-0 items-center rounded-full p-1",
        checked ? "bg-primary" : "bg-muted",
        disabled && "opacity-50",
        className
      )}
    >
      <Animated.View
        className="h-4 w-4 rounded-full bg-white shadow-sm"
        style={{ transform: [{ translateX }] }}
      />
    </Pressable>
  );
}
