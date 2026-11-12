import { Pressable, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import type { AiRoadmapCourse } from "@/types/ai";
import { ORANGE_DEEP } from "../format";

interface RoadmapCourseRowProps {
  course: AiRoadmapCourse;
  isDark: boolean;
  onPress: () => void;
}

/** One course inside a term: code, credits, reason, prerequisites. */
export function RoadmapCourseRow({ course, isDark, onPress }: RoadmapCourseRowProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${course.courseCode} ${course.courseName}`}
      className="rounded-2xl border border-line bg-surface px-3.5 py-3 active:opacity-70 dark:border-line-dark dark:bg-surface-dark"
    >
      <View className="flex-row items-start gap-3">
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text
              className="text-[11px] font-bold tabular-nums"
              style={{ color: isDark ? "#FFA371" : ORANGE_DEEP }}
            >
              {course.courseCode}
            </Text>
            {course.categoryName ? (
              <View
                className="rounded-full px-2 py-0.5"
                style={{ backgroundColor: isDark ? "#241F1B" : "#F2EDE7" }}
              >
                <Text className="text-[10px] font-semibold text-ink-muted dark:text-ink-muted-dark">
                  {course.categoryName}
                </Text>
              </View>
            ) : null}
            <Text className="text-[11px] text-ink-faint tabular-nums dark:text-ink-faint-dark">
              {course.credits} cr
            </Text>
          </View>

          <Text className="mt-1 text-[13px] font-semibold leading-[19px] text-ink dark:text-ink-dark">
            {course.courseName}
          </Text>

          {course.reason ? (
            <Text className="mt-1 text-[11px] leading-[16px] text-ink-muted dark:text-ink-muted-dark">
              {course.reason}
            </Text>
          ) : null}

          {course.prerequisites.length > 0 ? (
            <View className="mt-1.5 flex-row items-center gap-1.5">
              <MaterialCommunityIcons
                name="link-variant"
                size={12}
                color={isDark ? "#7D746C" : "#A79C93"}
              />
              <Text className="text-[11px] text-ink-faint dark:text-ink-faint-dark">
                Requires: {course.prerequisites.join(", ")}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}
