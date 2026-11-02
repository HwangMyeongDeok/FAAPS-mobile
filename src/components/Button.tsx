import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-[#F36F21] active:bg-[#D85A11] text-white border border-[#F36F21]",
  secondary:
    "bg-surface dark:bg-surface-dark text-ink dark:text-ink-dark border border-line dark:border-line-dark",
  ghost:
    "bg-transparent text-[#F36F21] active:bg-brand-tint border border-transparent",
};

export function Button({
  label,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  leftIcon,
  fullWidth = true,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={isDisabled}
      onPress={onPress}
      className={[
        "flex-row items-center justify-center rounded-xl px-4 py-3.5",
        variantClasses[variant],
        fullWidth ? "w-full" : "",
        isDisabled ? "opacity-50" : "",
      ].join(" ")}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <View className="flex-row items-center gap-2">
          {leftIcon}
          <Text
            className={[
              "text-base font-semibold",
              variant === "primary" ? "text-white" : "text-ink dark:text-ink-dark",
              variant === "ghost" ? "text-[#F36F21]" : "",
            ].join(" ")}
          >
            {label}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
