import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";
import { Animated, Pressable } from "react-native";

interface SwitchProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Switch({ checked = false, onCheckedChange, disabled, className }: SwitchProps) {
  const anim = useRef(new Animated.Value(checked ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: checked ? 1 : 0,
      friction: 6,
      useNativeDriver: true,
    }).start();
  }, [checked]);

  return (
    <Pressable
      onPress={() => !disabled && onCheckedChange?.(!checked)}
      className={cn(
        "h-6 w-11 shrink-0 items-center rounded-full p-1",
        checked ? "bg-primary" : "bg-muted",
        disabled && "opacity-50",
        className
      )}
    >
      <Animated.View
        className="h-4 w-4 rounded-full bg-white shadow-sm"
        style={{
          transform: [{ translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [0, 20] }) }],
        }}
      />
    </Pressable>
  );
}
