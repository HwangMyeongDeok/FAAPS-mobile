import { Pressable, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { Badge } from "@/components/ui";

export type CourseStatus = "completed" | "in_progress" | "locked" | "available";

export interface CourseItemData {
  /** The course id (UUID) used by the backend. */
  id: string;
  code: string;
  name: string;
  credits: number;
  /** The semester this course belongs to inside the curriculum. */
  semester: number;
  /** Whether the course is mandatory for the curriculum. */
  mandatory: boolean;
  /** The elective group, when the course belongs to one. */
  groupName: string | null;
  completed: boolean;
}

interface CourseItemProps {
  course: CourseItemData;
  /** When provided the row becomes tappable and opens the course detail sheet. */
  onPress?: (course: CourseItemData) => void;
  /** Default: derived from `completed` */
  status?: CourseStatus;
}

const statusVisuals: Record<
  CourseStatus,
  { iconName: string; color: string; label: string }
> = {
  completed: { iconName: "check-circle", color: "#10B981", label: "Completed" },
  in_progress: { iconName: "progress-clock", color: "#F59E0B", label: "In progress" },
  available: { iconName: "circle-outline", color: "#8B8178", label: "Available" },
  locked: { iconName: "lock", color: "#8B8178", label: "Locked" },
};

function deriveStatus(c: CourseItemData): CourseStatus {
  if (c.completed) return "completed";
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

      {/* Title + meta */}
      <View className="flex-1">
        <Text
          className="text-sm font-semibold text-ink dark:text-ink-dark"
          numberOfLines={1}
        >
          {course.name}
        </Text>
        <View className="mt-1 flex-row items-center gap-1.5">
          <Text className="text-xs text-ink-muted dark:text-ink-muted-dark">
            {course.code}
          </Text>
          <Text className="text-xs text-ink-muted dark:text-ink-muted-dark">·</Text>
          <Text className="text-xs text-ink-muted dark:text-ink-muted-dark">
            {course.credits} credits
          </Text>
          {course.mandatory ? (
            <>
              <Text className="text-xs text-ink-muted dark:text-ink-muted-dark">
                ·
              </Text>
              <Text className="text-xs font-semibold text-brand-ink dark:text-brand-ink-dark">
                Required
              </Text>
            </>
          ) : null}
        </View>
      </View>

      {/* Mandatory badge */}
      <Badge variant={course.mandatory ? "default" : "secondary"} className="px-2 py-0.5">
        {course.mandatory ? "Required" : "Elective"}
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
      accessibilityLabel={`${course.code} ${course.name}`}
      className="flex-row items-center gap-3 py-3"
    >
      {content}
    </Pressable>
  );
}
