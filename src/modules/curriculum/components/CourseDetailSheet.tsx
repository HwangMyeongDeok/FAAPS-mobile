import { Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { Badge, Separator, Sheet } from "@/components/ui";
import { courseTypeBadgeClass, courseTypeLabel, type CourseType } from "./CourseTypeIcon";
import type { CourseItemData } from "./CourseItem";

interface CourseDetailSheetProps {
  course: CourseItemData | null;
  /** Map of course_id → display name, used to render prereq names */
  courseLookup: Record<string, string>;
  onClose: () => void;
}

export function CourseDetailSheet({ course, courseLookup, onClose }: CourseDetailSheetProps) {
  if (!course) return null;

  return (
    <Sheet open={!!course} onClose={onClose}>
      <View className="flex-row items-center gap-3 mb-4">
        <View className="h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <MaterialCommunityIcons name="book-open-page-variant" size={22} color="hsl(20 90% 53%)" />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-bold text-foreground" numberOfLines={2}>
            {course.name}
          </Text>
          <Text className="text-sm text-muted-foreground mt-0.5">
            {course.course_code} · {course.credits} tín chỉ
          </Text>
        </View>
        <Badge variant={courseTypeBadgeClass(course.type)}>{courseTypeLabel(course.type)}</Badge>
      </View>

      <Separator className="my-3" />

      <View className="gap-3">
        <InfoRow label="Kỳ dự kiến" value={`Kỳ ${course.semester}`} />
        <InfoRow
          label="Trạng thái"
          value={course.completed ? "Đã hoàn thành" : "Chưa hoàn thành"}
          tone={course.completed ? "success" : "muted"}
        />
        <InfoRow
          label="Loại môn"
          value={courseTypeLabel(course.type)}
        />
      </View>

      <Separator className="my-3" />

      <View>
        <Text className="text-sm font-semibold text-foreground mb-2">Điều kiện tiên quyết</Text>
        {course.prerequisites.length === 0 ? (
          <View className="flex-row items-center gap-2">
            <MaterialCommunityIcons name="lock" size={14} color="hsl(215.4 16.3% 46.9%)" />
            <Text className="text-sm text-muted-foreground">Không có môn tiên quyết.</Text>
          </View>
        ) : (
          <View className="gap-2">
            {course.prerequisites.map((pid) => (
              <View key={pid} className="flex-row items-center gap-2">
                <View className="h-2 w-2 rounded-full bg-primary" />
                <Text className="text-sm text-foreground">{courseLookup[pid] ?? pid}</Text>
              </View>
            ))}
          </View>
        )}
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
      <Text className="text-sm text-muted-foreground">{label}</Text>
      <Text
        className={
          tone === "success"
            ? "text-sm font-semibold text-emerald-600"
            : tone === "muted"
            ? "text-sm text-muted-foreground"
            : "text-sm font-semibold text-foreground"
        }
      >
        {value}
      </Text>
    </View>
  );
}
