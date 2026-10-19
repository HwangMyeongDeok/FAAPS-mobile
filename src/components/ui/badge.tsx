import { cn } from "@/lib/utils";
import { Text, View, type ViewProps } from "react-native";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "success" | "warning";

interface BadgeProps extends ViewProps {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  destructive: "bg-destructive text-destructive-foreground",
  outline: "border border-input bg-transparent text-foreground",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
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
