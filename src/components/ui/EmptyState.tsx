/**
 * EmptyState — the standard "nothing here yet" block.
 *
 * DESIGN:
 * - Icon trong vòng tròn nền xám #F3F4F6, màu #6B7280.
 * - Tiêu đề #1A1A1A đậm, mô tả #6B7280.
 * - CTA cam tuỳ chọn.
 */
import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

import { FPT_ORANGE } from "./AppButton";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Icon nhạt hơn — dùng cho empty state không cần nhấn mạnh. */
  muted?: boolean;
}

export function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  onAction,
  muted = false,
}: EmptyStateProps) {
  return (
    <View className="items-center px-6 py-10">
      <View
        className="h-14 w-14 items-center justify-center rounded-full"
        style={{ backgroundColor: muted ? "#F3F4F6" : "#FFF1E7" }}
      >
        {icon}
      </View>
      <Text className="mt-4 text-center text-[15px]" style={{ color: "#1A1A1A", fontWeight: "700" }}>
        {title}
      </Text>
      {message ? (
        <Text
          className="mt-1.5 text-center text-[13px] leading-5"
          style={{ color: "#6B7280" }}
        >
          {message}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          className="mt-4 flex-row items-center justify-center gap-2 px-5 active:opacity-80"
          style={{
            height: 48,
            borderRadius: 12,
            backgroundColor: FPT_ORANGE,
          }}
        >
          <Text className="text-[15px]" style={{ color: "#FFFFFF", fontWeight: "600" }}>
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
