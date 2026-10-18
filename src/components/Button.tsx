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
    "bg-primary-500 active:bg-primary-600 text-white border border-primary-500",
  secondary:
    "bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700",
  ghost:
    "bg-transparent text-primary-500 active:bg-primary-50 border border-transparent",
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
              variant === "primary" ? "text-white" : "text-slate-900 dark:text-white",
              variant === "ghost" ? "text-primary-500" : "",
            ].join(" ")}
          >
            {label}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
