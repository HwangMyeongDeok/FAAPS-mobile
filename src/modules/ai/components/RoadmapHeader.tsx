import { Pressable, Text, View } from "react-native";
import { ChevronLeft, RefreshCw } from "lucide-react-native";

import { goBack } from "@/components/ScreenHeader";

interface RoadmapHeaderProps {
  isDark: boolean;
  isRegenerating: boolean;
  onRegenerate: () => void;
  subtitle?: string;
}

/** Screen header: back, title, single "Regenerate" primary action. */
export function RoadmapHeader({ isRegenerating, onRegenerate, subtitle }: RoadmapHeaderProps) {
  return (
    <View className="border-b border-[#E5E7EB] bg-white px-4 pb-3 pt-2">
      <View className="flex-row items-center gap-2">
        <Pressable
          onPress={goBack}
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
          hitSlop={10}
          className="-ml-1 h-10 w-10 items-center justify-center rounded-full active:opacity-70"
        >
          <ChevronLeft size={24} color="#1A1A1A" />
        </Pressable>

        <View className="flex-1">
          <Text accessibilityRole="header" className="text-[17px]" style={{ color: "#1A1A1A", fontWeight: "700" }}>
            Lộ trình AI
          </Text>
          <Text className="text-[11px]" style={{ color: "#6B7280" }}>
            {subtitle ?? "Đề xuất của AI cho các học kỳ còn lại"}
          </Text>
        </View>

        <Pressable
          onPress={onRegenerate}
          disabled={isRegenerating}
          accessibilityRole="button"
          accessibilityLabel="Tạo lại lộ trình"
          className="flex-row items-center gap-1.5 rounded-xl px-3.5 py-2.5 active:opacity-80"
          style={{ backgroundColor: "#F37021", opacity: isRegenerating ? 0.6 : 1 }}
        >
          <RefreshCw size={14} color="#FFFFFF" />
          <Text className="text-[12px]" style={{ color: "#FFFFFF", fontWeight: "700" }}>
            Tạo lại
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
