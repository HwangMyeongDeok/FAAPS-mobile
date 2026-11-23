/**
 * AppButton — the standard action button.
 *
 * DESIGN:
 * - Bo góc 12px, height 48px, font weight 600.
 * - Primary: cam FPT #F37021 nền, text trắng.
 * - Outline: nền trắng, viền #E5E7EB (hoặc cam khi `accent`).
 * - Ghost: không nền.
 */
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

export const FPT_ORANGE = "#F37021";
export const BUTTON_RADIUS = 12;
export const BUTTON_HEIGHT = 48;

type Variant = "primary" | "outline" | "accentOutline" | "ghost" | "danger";

interface AppButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
  className?: string;
}

export function AppButton({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  icon,
  fullWidth = true,
  className,
}: AppButtonProps) {
  const isDisabled = disabled || loading;

  const surface = (() => {
    switch (variant) {
      case "primary":
        return { backgroundColor: FPT_ORANGE, borderColor: FPT_ORANGE, textColor: "#FFFFFF" };
      case "accentOutline":
        return { backgroundColor: "#FFFFFF", borderColor: FPT_ORANGE, textColor: FPT_ORANGE };
      case "danger":
        return { backgroundColor: "#FFFFFF", borderColor: "#EF4444", textColor: "#EF4444" };
      case "outline":
        return { backgroundColor: "#FFFFFF", borderColor: "#E5E7EB", textColor: "#1A1A1A" };
      default:
        return { backgroundColor: "transparent", borderColor: "transparent", textColor: FPT_ORANGE };
    }
  })();

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      className={cn(
        "flex-row items-center justify-center gap-2 active:opacity-80",
        fullWidth && "self-stretch",
        className,
      )}
      style={{
        height: BUTTON_HEIGHT,
        borderRadius: BUTTON_RADIUS,
        backgroundColor: surface.backgroundColor,
        borderWidth: variant === "ghost" ? 0 : 1.5,
        borderColor: surface.borderColor,
        opacity: isDisabled ? 0.5 : 1,
      }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={surface.textColor} />
      ) : (
        <View className="flex-row items-center gap-2">
          {icon ? <View className="shrink-0">{icon}</View> : null}
          <Text
            className="text-[15px]"
            style={{ color: surface.textColor, fontWeight: "600" }}
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
