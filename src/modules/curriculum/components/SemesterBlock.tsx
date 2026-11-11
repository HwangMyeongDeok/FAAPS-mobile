import { useState } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { Badge, Progress, Separator } from "@/components/ui";
import { CourseItem, type CourseItemData } from "./CourseItem";

interface SemesterBlockProps {
  semesterNumber: number;
  totalCredits: number;
  earnedCredits: number;
  /** Status of this semester for the student */
  status: "completed" | "in_progress" | "upcoming";
  courses: CourseItemData[];
  onCoursePress?: (course: CourseItemData) => void;
}

const statusBadge: Record<
  SemesterBlockProps["status"],
  { label: string; variant: "default" | "secondary" | "success" | "warning" }
> = {
  completed: { label: "Completed", variant: "success" },
  in_progress: { label: "In progress", variant: "warning" },
  upcoming: { label: "Upcoming", variant: "secondary" },
};

export function SemesterBlock({
  semesterNumber,
  totalCredits,
  earnedCredits,
  status,
  courses,
  onCoursePress,
}: SemesterBlockProps) {
  const [open, setOpen] = useState(status === "in_progress");
  const rotateAnim = useState(new Animated.Value(open ? 1 : 0))[0];

  const toggle = () => {
    Animated.spring(rotateAnim, {
      toValue: open ? 0 : 1,
      friction: 6,
      useNativeDriver: true,
    }).start();
    setOpen(!open);
  };

  const completionPercent =
    totalCredits === 0 ? 0 : Math.round((earnedCredits / totalCredits) * 100);
  const meta = statusBadge[status];

  return (
    <View className="rounded-3xl border border-line bg-surface dark:border-line-dark dark:bg-surface-dark mb-3 overflow-hidden">
      <Pressable onPress={toggle} className="flex-row items-center p-4">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-brand-tint dark:bg-brand-tint-dark mr-3">
          <Text className="text-sm font-bold text-brand-ink dark:text-brand-ink-dark">
            {semesterNumber}
          </Text>
        </View>

        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="text-base font-semibold text-ink dark:text-ink-dark">
              Semester {semesterNumber}
            </Text>
            <Badge variant={meta.variant}>{meta.label}</Badge>
          </View>
          <Text className="text-xs text-ink-muted dark:text-ink-muted-dark mt-1">
            {earnedCredits}/{totalCredits} credits · {courses.length} courses
          </Text>
          {totalCredits > 0 && (
            <View className="mt-2">
              <Progress
                value={completionPercent}
                color={
                  status === "completed"
                    ? "success"
                    : status === "in_progress"
                      ? "primary"
                      : "warning"
                }
              />
            </View>
          )}
        </View>

        <Animated.View
          style={{
            transform: [
              {
                rotate: rotateAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0deg", "-180deg"],
                }),
              },
            ],
          }}
        >
          <MaterialCommunityIcons name="chevron-down" size={20} color="#8B8178" />
        </Animated.View>
      </Pressable>

      {open && (
        <View className="px-4 pb-4">
          <Separator className="mb-1" />
          {courses.length === 0 ? (
            <Text className="text-sm text-ink-muted dark:text-ink-muted-dark text-center py-4">
              No courses in this semester.
            </Text>
          ) : (
            courses.map((c, idx) => (
              <View key={c.id}>
                <CourseItem course={c} onPress={onCoursePress} />
                {idx < courses.length - 1 && <Separator />}
              </View>
            ))
          )}
        </View>
      )}
    </View>
  );
}
