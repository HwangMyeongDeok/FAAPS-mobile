import { cn } from "@/lib/utils";
import { View, type ViewProps } from "react-native";

interface SkeletonProps extends ViewProps {
  width?: number | string;
  height?: number | string;
}

export function Skeleton({ width, height = 16, className, style, ...props }: SkeletonProps) {
  return (
    <View
      {...props}
      className={cn("animate-pulse rounded-md bg-muted", className)}
      style={[
        { width: width as any, height: height as any },
        style,
      ]}
    />
  );
}
