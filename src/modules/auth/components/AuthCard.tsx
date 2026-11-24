/**
 * AuthCard — the white surface every auth form sits on.
 *
 * DESIGN:
 * - Card trắng #FFFFFF, bo góc 16px, shadow 0 1px 3px rgba(0,0,0,0.05).
 */
import type { ReactNode } from "react";
import { Text, View } from "react-native";

const INK = "#1A1A1A";
const MUTED = "#6B7280";

interface AuthCardProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <View
      className="mx-5 mt-5 px-5 py-5"
      style={{
        borderRadius: 16,
        backgroundColor: "#FFFFFF",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
      }}
    >
      <Text className="text-[17px]" style={{ color: INK, fontWeight: "700" }}>
        {title}
      </Text>
      {description ? (
        <Text className="mt-1.5 text-[13px] leading-5" style={{ color: MUTED }}>
          {description}
        </Text>
      ) : null}
      <View className="mt-4">{children}</View>
    </View>
  );
}
