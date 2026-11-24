import { Pressable, Text } from "react-native";
import { Link2 } from "lucide-react-native";

import type { AiRoadmapCourse } from "@/types/ai";

interface CourseChipProps {
  course: AiRoadmapCourse;
  onPress: () => void;
}

/** One course as a compact chip: code · name · credits. */
export function RoadmapCourseChip({ course, onPress }: CourseChipProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${course.courseCode} ${course.courseName}`}
      className="flex-row items-center gap-2 rounded-lg px-2.5 py-2 active:opacity-70"
      style={{ backgroundColor: "#F3F4F6" }}
    >
      <Text className="text-[11px] tabular-nums" style={{ color: "#B45309", fontWeight: "700" }}>
        {course.courseCode}
      </Text>
      <Text
        className="flex-1 text-[12px]"
        style={{ color: "#1A1A1A", fontWeight: "600" }}
        numberOfLines={1}
      >
        {course.courseName}
      </Text>
      {course.prerequisites.length > 0 ? (
        <Link2 size={11} color="#9CA3AF" />
      ) : null}
      <Text className="text-[10px]" style={{ color: "#6B7280", fontWeight: "600" }}>
        {course.credits} tc
      </Text>
    </Pressable>
  );
}
