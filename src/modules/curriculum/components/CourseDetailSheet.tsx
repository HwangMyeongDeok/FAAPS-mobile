import { Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { Badge, Separator, Sheet } from "@/components/ui";
import type { CourseItemData } from "./CourseItem";

interface CourseDetailSheetProps {
  course: CourseItemData | null;
  /** Map of course code → display name, used to render prerequisite names */
  courseLookup: Record<string, string>;
  onClose: () => void;
}

export function CourseDetailSheet({
  course,
  courseLookup,
  onClose,
}: CourseDetailSheetProps) {
  if (!course) return null;

  return (
    <Sheet open={!!course} onClose={onClose}>
      <View className="flex-row items-center gap-3 mb-4">
        <View className="h-12 w-12 items-center justify-center rounded-2xl bg-brand-tint dark:bg-brand-tint-dark">
          <MaterialCommunityIcons
            name="book-open-page-variant"
            size={22}
            color="#F36F21"
          />
        </View>
        <View className="flex-1">
          <Text
            className="text-lg font-bold text-ink dark:text-ink-dark"
            numberOfLines={2}
          >
            {course.name}
          </Text>
          <Text className="text-sm text-ink-muted dark:text-ink-muted-dark mt-0.5">
            {course.code} · {course.credits} credits
          </Text>
        </View>
        <Badge variant={course.mandatory ? "default" : "secondary"}>
          {course.mandatory ? "Required" : "Elective"}
        </Badge>
      </View>

      <Separator className="my-3" />

      <View className="gap-3">
        <InfoRow label="Planned semester" value={`Semester ${course.semester}`} />
        <InfoRow
          label="Status"
          value={course.completed ? "Completed" : "Not completed"}
          tone={course.completed ? "success" : "muted"}
        />
        <InfoRow label="Type" value={course.mandatory ? "Required" : "Elective"} />
        {course.groupName ? (
          <InfoRow label="Elective group" value={course.groupName} />
        ) : null}
      </View>
    </Sheet>
  );
}

function InfoRow({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "success" | "muted";
}) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-sm text-ink-muted dark:text-ink-muted-dark">{label}</Text>
      <Text
        className={
          tone === "success"
            ? "text-sm font-semibold text-emerald-600 dark:text-emerald-400"
            : tone === "muted"
              ? "text-sm text-ink-muted dark:text-ink-muted-dark"
              : "text-sm font-semibold text-ink dark:text-ink-dark"
        }
      >
        {value}
      </Text>
    </View>
  );
}
