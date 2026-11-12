import { Pressable, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import type { AiRoadmapSemester } from "@/types/ai";
import { ORANGE, ORANGE_DEEP } from "../format";
import { RoadmapCourseRow } from "./RoadmapCourseRow";

interface TermNodeProps {
  semester: AiRoadmapSemester;
  isLast: boolean;
  isDark: boolean;
  open: boolean;
  onToggle: () => void;
  onCoursePress: () => void;
}

/** One term on the vertical timeline: rail node + card + course rows. */
export function TermNode({
  semester,
  isLast,
  isDark,
  open,
  onToggle,
  onCoursePress,
}: TermNodeProps) {
  const credits = semester.courses.reduce((s, c) => s + c.credits, 0);
  const isCurrent = semester.status === "IN_PROGRESS";
  const isCompleted = semester.status === "COMPLETED";

  return (
    <View className="flex-row gap-3">
      <View className="items-center" style={{ width: 26 }}>
        <View
          className="items-center justify-center rounded-full"
          style={{
            width: 26,
            height: 26,
            backgroundColor: isCurrent ? ORANGE : "transparent",
            borderWidth: isCurrent ? 0 : 2,
            borderColor: isCompleted
              ? isDark
                ? "#3A332C"
                : "#D8CEC3"
              : isDark
                ? "#302A24"
                : "#EAE1D8",
          }}
        >
          {isCurrent ? (
            <MaterialCommunityIcons name="star" size={13} color="#FFFFFF" />
          ) : isCompleted ? (
            <MaterialCommunityIcons
              name="check"
              size={13}
              color={isDark ? "#7D746C" : "#A79C93"}
            />
          ) : (
            <Text
              className="text-[11px] font-bold tabular-nums"
              style={{ color: isDark ? "#A79C93" : "#8B8178" }}
            >
              {semester.semesterNumber}
            </Text>
          )}
        </View>
        {!isLast ? (
          <View
            className="w-[2px] flex-1"
            style={{
              backgroundColor: isDark ? "#302A24" : "#EAE1D8",
              minHeight: 20,
              marginVertical: 4,
            }}
          />
        ) : null}
      </View>

      <View className="flex-1 pb-3">
        <Pressable
          onPress={onToggle}
          accessibilityRole="button"
          accessibilityLabel={`${semester.title} · ${semester.semesterCode}`}
          accessibilityState={{ expanded: open }}
          className="rounded-3xl border border-line bg-surface px-4 py-3.5 active:opacity-80 dark:border-line-dark dark:bg-surface-dark"
          style={isCurrent ? { borderColor: ORANGE, borderWidth: 1.5 } : undefined}
        >
          <View className="flex-row items-start gap-2">
            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                <Text className="text-[15px] font-bold text-ink dark:text-ink-dark">
                  {semester.title}
                </Text>
                {isCurrent ? (
                  <View
                    className="rounded-full px-2 py-0.5"
                    style={{ backgroundColor: isDark ? "#2E1C0E" : "#FFF1E7" }}
                  >
                    <Text
                      className="text-[10px] font-bold"
                      style={{ color: isDark ? "#FFA371" : ORANGE_DEEP }}
                    >
                      CURRENT
                    </Text>
                  </View>
                ) : null}
                {semester.status === "PLANNED" ? (
                  <View
                    className="rounded-full px-2 py-0.5"
                    style={{ backgroundColor: isDark ? "#241F1B" : "#F2EDE7" }}
                  >
                    <Text className="text-[10px] font-bold text-ink-muted dark:text-ink-muted-dark">
                      AI PROPOSAL
                    </Text>
                  </View>
                ) : null}
              </View>

              <Text className="mt-1 text-[11px] text-ink-muted tabular-nums dark:text-ink-muted-dark">
                {semester.semesterCode} · {semester.courses.length} courses · {credits} credits
              </Text>
            </View>

            <MaterialCommunityIcons
              name={open ? "chevron-up" : "chevron-down"}
              size={20}
              color={isDark ? "#A79C93" : "#8B8178"}
            />
          </View>

          {semester.note ? (
            <Text className="mt-2 text-[12px] leading-[17px] text-ink-muted dark:text-ink-muted-dark">
              {semester.note}
            </Text>
          ) : null}
        </Pressable>

        {open ? (
          <View className="mt-2">
            {semester.courses.length === 0 ? (
              <View
                className="rounded-2xl border border-dashed px-4 py-4"
                style={{ borderColor: isDark ? "#302A24" : "#EAE1D8" }}
              >
                <Text className="text-center text-[12px] text-ink-muted dark:text-ink-muted-dark">
                  No courses in this semester
                </Text>
              </View>
            ) : (
              <View className="gap-2">
                {semester.courses.map((course) => (
                  <RoadmapCourseRow
                    key={`${semester.semesterNumber}-${course.courseId}`}
                    course={course}
                    isDark={isDark}
                    onPress={onCoursePress}
                  />
                ))}
              </View>
            )}
          </View>
        ) : null}
      </View>
    </View>
  );
}
