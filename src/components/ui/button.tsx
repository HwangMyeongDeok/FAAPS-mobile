import { cn } from "@/lib/utils";
import { forwardRef, type ComponentProps, type ReactNode } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

type Variant = "primary" | "secondary" | "destructive" | "outline" | "ghost";
type Size = "default" | "sm" | "lg" | "icon";

interface ButtonProps {
  variant?: Variant;
  size?: Size;
  label: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  onPress?: ComponentProps<typeof Pressable>["onPress"];
}

const variantClasses: Record<Variant, string> = {
  primary:   "bg-primary text-primary-foreground hover:opacity-90 active:opacity-80",
  secondary: "bg-secondary text-secondary-foreground hover:opacity-90 active:opacity-80",
  destructive:"bg-destructive text-destructive-foreground hover:opacity-90 active:opacity-80",
  outline:   "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  ghost:     "hover:bg-accent hover:text-accent-foreground",
};

const sizeClasses: Record<Size, string> = {
  default: "h-11 px-4 py-2 rounded-md",
  sm:     "h-9  px-3 rounded-md text-sm",
  lg:     "h-12 px-8 rounded-md text-base",
  icon:   "h-11 w-11 rounded-md",
};

export const Button = forwardRef<Pressable, ButtonProps>(
  ({ variant = "primary", size = "default", label, leftIcon, rightIcon, loading = false, disabled, className, onPress }, _ref) => {
    const isDisabled = disabled || loading;

    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        className={cn(
          "flex-row items-center justify-center gap-2",
          variantClasses[variant],
          sizeClasses[size],
          isDisabled && "opacity-50",
          className
        )}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === "primary" || variant === "destructive" ? "#fff" : "#222"}
          />
        ) : (
          <View className="flex-row items-center gap-2">
            {leftIcon  && <View className="shrink-0">{leftIcon}</View>}
            <Text className={cn("font-medium text-base", variant === "primary" || variant === "destructive" ? "text-white" : "text-foreground")}>
              {label}
            </Text>
            {rightIcon && <View className="shrink-0">{rightIcon}</View>}
          </View>
        )}
      </Pressable>
    );
  }
);
Button.displayName = "Button";
