import { Pressable, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { Badge } from "@/components/ui";
import { CourseTypeIcon, courseTypeBadgeClass, courseTypeLabel, type CourseType } from "./CourseTypeIcon";

export type CourseStatus = "completed" | "in_progress" | "locked" | "available";

export interface CourseItemData {
  id: string;
  course_code: string;
  name: string;
  credits: number;
  type: CourseType;
  semester: number;
  prerequisites: string[];
  completed: boolean;
}

interface CourseItemProps {
  course: CourseItemData;
  /** When provided the row becomes tappable and opens the course detail sheet. */
  onPress?: (course: CourseItemData) => void;
  /** Default: derived from `completed` */
  status?: CourseStatus;
}

const statusVisuals: Record<CourseStatus, {
  iconName: string;
  color: string;
  label: string;
}> = {
  completed:   { iconName: "check-circle",     color: "#10B981", label: "Hoàn thành" },
  in_progress: { iconName: "progress-clock",    color: "#F59E0B", label: "Đang học"   },
  available:   { iconName: "circle-outline",   color: "#94A3B8", label: "Sẵn sàng"   },
  locked:      { iconName: "lock",             color: "#CBD5E1", label: "Bị khóa"    },
};

function deriveStatus(c: CourseItemData): CourseStatus {
  if (c.completed) return "completed";
  if (c.prerequisites.length === 0) return "available";
  // 'locked' is just a default for the demo — real lock logic would
  // check whether all prereqs are completed.
  return "available";
}

export function CourseItem({ course, onPress, status }: CourseItemProps) {
  const effectiveStatus = status ?? deriveStatus(course);
  const visual = statusVisuals[effectiveStatus];

  const content = (
    <>
      {/* Status icon */}
      <View
        className="h-9 w-9 items-center justify-center rounded-full"
        style={{ backgroundColor: `${visual.color}1A` }}
      >
        <MaterialCommunityIcons
          name={visual.iconName as any}
          size={18}
          color={visual.color}
        />
      </View>

      {/* Course type icon */}
      <CourseTypeIcon type={course.type} size={16} />

      {/* Title + meta */}
      <View className="flex-1">
        <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
          {course.name}
        </Text>
        <View className="mt-1 flex-row items-center gap-1.5">
          <Text className="text-xs text-muted-foreground">{course.course_code}</Text>
          <Text className="text-xs text-muted-foreground">·</Text>
          <Text className="text-xs text-muted-foreground">{course.credits} TC</Text>
        </View>
      </View>

      {/* Type badge */}
      <Badge variant={courseTypeBadgeClass(course.type)} className="px-2 py-0.5">
        {courseTypeLabel(course.type)}
      </Badge>
    </>
  );

  if (!onPress) {
    return <View className="flex-row items-center gap-3 py-3">{content}</View>;
  }

  return (
    <Pressable
      onPress={() => onPress(course)}
      accessibilityRole="button"
      accessibilityLabel={`${course.course_code} ${course.name}`}
      className="flex-row items-center gap-3 py-3"
    >
      {content}
    </Pressable>
  );
}
