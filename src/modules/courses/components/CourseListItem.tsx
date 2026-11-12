import { Pressable, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { Badge } from "@/components/ui";
import { categoryBadgeVariant, courseCategoryVisual } from "@/modules/curriculum";
import type { Course } from "@/types/course";

interface CourseListItemProps {
  course: Course;
  onPress: (course: Course) => void;
}

/** One catalogue row: icon, name, code/credits, category badge. */
export function CourseListItem({ course, onPress }: CourseListItemProps) {
  const cat = courseCategoryVisual(course.category);
  return (
    <Pressable
      onPress={() => onPress(course)}
      accessibilityRole="button"
      accessibilityLabel={`${course.code} ${course.name}`}
      className="rounded-2xl border border-line bg-surface p-4 active:opacity-80 dark:border-line-dark dark:bg-surface-dark"
    >
      <View className="flex-row items-start gap-3">
        <View
          className="h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${cat.color}1A` }}
        >
          <MaterialCommunityIcons name={cat.iconName as never} size={20} color={cat.color} />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-semibold text-ink dark:text-ink-dark" numberOfLines={2}>
            {course.name}
          </Text>
          <View className="mt-1 flex-row items-center gap-2">
            <Text className="font-mono text-xs text-ink-muted dark:text-ink-muted-dark">
              {course.code}
            </Text>
            <Text className="text-xs text-ink-faint dark:text-ink-faint-dark">·</Text>
            <Text className="text-xs tabular-nums text-ink-muted dark:text-ink-muted-dark">
              {course.credits} credits
            </Text>
          </View>
        </View>
        <Badge variant={categoryBadgeVariant(course.category)} className="px-2 py-0.5">
          {cat.label}
        </Badge>
      </View>
    </Pressable>
  );
}
