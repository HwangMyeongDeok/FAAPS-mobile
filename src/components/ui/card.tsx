import { cn } from "@/lib/utils";
import { View, type ViewProps } from "react-native";

interface CardProps extends ViewProps {
  className?: string;
}

export function Card({ className, ...props }: CardProps) {
  return (
    <View
      {...props}
      className={cn(
        "rounded-lg border border-border bg-card text-card-foreground shadow-sm",
        className
      )}
    />
  );
}

export function CardHeader({ className, ...props }: ViewProps) {
  return (
    <View
      {...props}
      className={cn("flex flex-col space-y-1.5 p-5", className)}
    />
  );
}

export function CardTitle({ className, ...props }: ViewProps) {
  return (
    <View
      {...props}
      className={cn("font-semibold text-xl leading-none tracking-tight", className)}
    />
  );
}

export function CardDescription({ className, ...props }: ViewProps) {
  return (
    <View
      {...props}
      className={cn("text-sm text-muted-foreground", className)}
    />
  );
}

export function CardContent({ className, ...props }: ViewProps) {
  return <View {...props} className={cn("p-5 pt-0", className)} />;
}

export function CardFooter({ className, ...props }: ViewProps) {
  return (
    <View
      {...props}
      className={cn("flex flex-row items-center p-5 pt-0", className)}
    />
  );
}
