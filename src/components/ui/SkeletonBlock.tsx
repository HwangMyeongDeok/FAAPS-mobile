/**
 * SkeletonBlock — a shimmering placeholder block.
 *
 * Mirrors the shape of the content it stands in for, so the layout does not
 * jump when the real data arrives.
 */
import { cn } from "@/lib/utils";
import { View, type ViewProps } from "react-native";

interface SkeletonBlockProps extends ViewProps {
  width?: number | string;
  height?: number | string;
  radius?: number;
}

export function SkeletonBlock({
  width,
  height = 16,
  radius = 8,
  className,
  style,
  ...props
}: SkeletonBlockProps) {
  return (
    <View
      {...props}
      className={cn("bg-[#E5E7EB] dark:bg-[#262019]", className)}
      style={[{ width: width as never, height, borderRadius: radius }, style]}
    />
  );
}
