import { useState } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { ChevronDown } from "lucide-react-native";

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

const statusBadge: Record<SemesterBlockProps["status"], { label: string; variant: "default" | "secondary" | "success" | "warning" }> = {
  completed:   { label: "Hoàn thành", variant: "success" },
  in_progress: { label: "Đang học",   variant: "warning" },
  upcoming:    { label: "Sắp tới",    variant: "secondary" },
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

  const completionPercent = totalCredits === 0 ? 0 : Math.round((earnedCredits / totalCredits) * 100);
  const meta = statusBadge[status];

  return (
    <View className="rounded-2xl border border-border bg-card mb-3 overflow-hidden">
      <Pressable onPress={toggle} className="flex-row items-center p-4">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/10 mr-3">
          <Text className="text-sm font-bold text-primary">{semesterNumber}</Text>
        </View>

        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="text-base font-semibold text-foreground">Kỳ {semesterNumber}</Text>
            <Badge variant={meta.variant}>{meta.label}</Badge>
          </View>
          <Text className="text-xs text-muted-foreground mt-1">
            {earnedCredits}/{totalCredits} tín chỉ · {courses.length} môn
          </Text>
          {totalCredits > 0 && (
            <View className="mt-2">
              <Progress value={completionPercent} color={status === "completed" ? "success" : status === "in_progress" ? "primary" : "warning"} />
            </View>
          )}
        </View>

        <Animated.View style={{ transform: [{ rotate: rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "-180deg"] }) }] }}>
          <ChevronDown size={20} color="hsl(215.4 16.3% 46.9%)" />
        </Animated.View>
      </Pressable>

      {open && (
        <View className="px-4 pb-4">
          <Separator className="mb-1" />
          {courses.length === 0 ? (
            <Text className="text-sm text-muted-foreground text-center py-4">Chưa có môn học.</Text>
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
