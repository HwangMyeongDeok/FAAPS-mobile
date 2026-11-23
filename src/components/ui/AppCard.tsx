/**
 * AppCard — the standard surface of the app.
 *
 * DESIGN:
 * - Card trắng #FFFFFF, bo góc 16px.
 * - Shadow nhẹ 0 1px 3px rgba(0,0,0,0.05).
 * - Border #E5E7EB (tuỳ chọn).
 */
import { cn } from "@/lib/utils";
import { View, type ViewProps } from "react-native";

export const CARD_RADIUS = 16;
export const CARD_BORDER = "#E5E7EB";
export const CARD_BG = "#FFFFFF";
export const CARD_SHADOW = {
  shadowColor: "#000",
  shadowOpacity: 0.05,
  shadowRadius: 3,
  shadowOffset: { width: 0, height: 1 },
  elevation: 1,
} as const;

interface AppCardProps extends ViewProps {
  /** Bỏ shadow khi card nằm sát nhau (ví dụ trong list). */
  flat?: boolean;
  padded?: boolean;
}

export function AppCard({
  flat = false,
  padded = true,
  className,
  style,
  children,
  ...props
}: AppCardProps) {
  return (
    <View
      {...props}
      className={cn(padded && "px-4 py-4", className)}
      style={[
        {
          backgroundColor: CARD_BG,
          borderRadius: CARD_RADIUS,
          borderWidth: 1,
          borderColor: CARD_BORDER,
        },
        flat ? null : CARD_SHADOW,
        style,
      ]}
    >
      {children}
    </View>
  );
}
