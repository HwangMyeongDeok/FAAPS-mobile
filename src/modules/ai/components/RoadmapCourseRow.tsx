import { Pressable, Text, View } from "react-native";
import { Link2 } from "lucide-react-native";

import type { AiRoadmapCourse } from "@/types/ai";

interface RoadmapCourseRowProps {
  course: AiRoadmapCourse;
  isDark: boolean;
  onPress: () => void;
}

/** One course inside a term: code, credits, reason, prerequisites. */
export function RoadmapCourseRow({ course, onPress }: RoadmapCourseRowProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${course.courseCode} ${course.courseName}`}
      className="rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-3 active:opacity-70"
    >
      <View className="flex-row items-start gap-3">
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="text-[11px] tabular-nums" style={{ color: "#B45309", fontWeight: "700" }}>
              {course.courseCode}
            </Text>
            {course.categoryName ? (
              <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: "#F3F4F6" }}>
                <Text className="text-[10px]" style={{ color: "#6B7280", fontWeight: "600" }}>
                  {course.categoryName}
                </Text>
              </View>
            ) : null}
            <Text className="text-[11px] tabular-nums" style={{ color: "#6B7280" }}>
              {course.credits} tc
            </Text>
          </View>

          <Text className="mt-1 text-[13px] leading-[19px]" style={{ color: "#1A1A1A", fontWeight: "600" }}>
            {course.courseName}
          </Text>

          {course.reason ? (
            <Text className="mt-1 text-[11px] leading-[16px]" style={{ color: "#6B7280" }}>
              {course.reason}
            </Text>
          ) : null}

          {course.prerequisites.length > 0 ? (
            <View className="mt-1.5 flex-row items-center gap-1.5">
              <Link2 size={12} color="#9CA3AF" />
              <Text className="text-[11px]" style={{ color: "#6B7280" }}>
                Yêu cầu trước: {course.prerequisites.join(", ")}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}
