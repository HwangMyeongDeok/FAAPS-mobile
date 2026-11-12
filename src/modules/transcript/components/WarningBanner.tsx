import { Pressable, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";

export function WarningBanner({ failedCourses, isDark }: { failedCourses: string[]; isDark: boolean }) {
  return (
    <View className="px-5 pt-4">
      <View
        className="overflow-hidden rounded-3xl border p-4"
        style={{
          backgroundColor: isDark ? "#2A1E05" : "#FFFBEB",
          borderColor: isDark ? "#B45309" : "#F59E0B",
        }}
      >
        <View className="flex-row items-center gap-3">
          <View className="h-11 w-11 items-center justify-center rounded-2xl" style={{ backgroundColor: "#F59E0B" }}>
            <MaterialCommunityIcons name="alert-decagram" size={22} color="#FFFFFF" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-bold" style={{ color: isDark ? "#FCD34D" : "#92400E" }}>
              Academic warning · PROBATION
            </Text>
            <Text className="mt-0.5 text-[11px] leading-4" style={{ color: isDark ? "#E7C46B" : "#92600E" }}>
              {failedCourses.length > 0
                ? `You did not pass ${failedCourses.join(", ")}. Meet your advisor to build a recovery plan before the next registration.`
                : "Your academic standing needs attention. Meet your advisor to build a recovery plan."}
            </Text>
          </View>
        </View>
        <Pressable
          onPress={() => router.push("/(app)/advising")}
          accessibilityRole="button"
          accessibilityLabel="Talk to your advisor about the academic warning"
          className="mt-3 flex-row items-center justify-center gap-2 rounded-2xl py-3 active:opacity-85 active:scale-[0.99]"
          style={{ backgroundColor: "#F59E0B" }}
        >
          <MaterialCommunityIcons name="chat-outline" size={16} color="#FFFFFF" />
          <Text className="text-[13px] font-bold text-white">Talk to your advisor</Text>
        </Pressable>
      </View>
    </View>
  );
}
