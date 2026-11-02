import { cn } from "@/lib/utils";
import { Text, View, type ViewProps } from "react-native";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "success" | "warning";

interface BadgeProps extends ViewProps {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-[#F36F21] text-white",
  secondary: "bg-raised text-ink-muted dark:bg-raised-dark dark:text-ink-muted-dark",
  destructive: "bg-destructive text-destructive-foreground",
  outline: "border border-line dark:border-line-dark bg-transparent text-ink dark:text-ink-dark",
  success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
};

export function Badge({ variant = "default", className, children, ...props }: BadgeProps) {
  return (
    <View
      {...props}
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className
      )}
    >
      <Text className="font-medium text-xs">{children}</Text>
    </View>
  );
}
