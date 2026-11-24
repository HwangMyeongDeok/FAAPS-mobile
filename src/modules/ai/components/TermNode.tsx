import { Pressable, Text, View } from "react-native";
import { Check, ChevronDown, ChevronUp, Star } from "lucide-react-native";

import { AppBadge } from "@/components/ui/AppBadge";
import type { AiRoadmapSemester } from "@/types/ai";
import { RoadmapCourseChip } from "./RoadmapCourseChip";

interface TermNodeProps {
  semester: AiRoadmapSemester;
  isLast: boolean;
  isDark: boolean;
  open: boolean;
  onToggle: () => void;
  onCoursePress: () => void;
}

const ORANGE = "#F37021";
const INK = "#1A1A1A";
const MUTED = "#6B7280";

/** One semester on the vertical timeline: rail node + card + course chips. */
export function TermNode({
  semester,
  isLast,
  open,
  onToggle,
  onCoursePress,
}: TermNodeProps) {
  const credits = semester.courses.reduce((s, c) => s + c.credits, 0);
  const isCurrent = semester.status === "IN_PROGRESS";
  const isCompleted = semester.status === "COMPLETED";

  return (
    <View className="flex-row gap-3">
      {/* Timeline rail */}
      <View className="items-center" style={{ width: 24 }}>
        <View
          className="items-center justify-center rounded-full"
          style={{
            width: 24,
            height: 24,
            backgroundColor: isCurrent ? ORANGE : isCompleted ? "#10B981" : "#FFFFFF",
            borderWidth: isCurrent || isCompleted ? 0 : 2,
            borderColor: "#E5E7EB",
          }}
        >
          {isCurrent ? (
            <Star size={12} color="#FFFFFF" fill="#FFFFFF" />
          ) : isCompleted ? (
            <Check size={13} color="#FFFFFF" />
          ) : (
            <Text className="text-[10px] tabular-nums" style={{ color: MUTED, fontWeight: "700" }}>
              {semester.semesterNumber}
            </Text>
          )}
        </View>
        {!isLast ? (
          <View
            className="w-[2px] flex-1"
            style={{ backgroundColor: "#E5E7EB", minHeight: 20, marginVertical: 4 }}
          />
        ) : null}
      </View>

      <View className="flex-1 pb-3">
        <Pressable
          onPress={onToggle}
          accessibilityRole="button"
          accessibilityLabel={`${semester.title} · ${semester.semesterCode}`}
          accessibilityState={{ expanded: open }}
          className="rounded-2xl border bg-white px-4 py-3.5 active:opacity-80"
          style={{
            borderColor: isCurrent ? ORANGE : "#E5E7EB",
            borderWidth: isCurrent ? 1.5 : 1,
            shadowColor: "#000",
            shadowOpacity: 0.05,
            shadowRadius: 3,
            shadowOffset: { width: 0, height: 1 },
            elevation: 1,
          }}
        >
          <View className="flex-row items-start gap-2">
            <View className="flex-1">
              <View className="flex-row flex-wrap items-center gap-1.5">
                <Text className="text-[15px]" style={{ color: INK, fontWeight: "700" }}>
                  {semester.title}
                </Text>
                {isCurrent ? <AppBadge label="Hiện tại" tone="primary" /> : null}
                {semester.status === "PLANNED" ? <AppBadge label="AI đề xuất" tone="neutral" /> : null}
                {isCompleted ? <AppBadge label="Hoàn thành" tone="success" /> : null}
              </View>
              <Text className="mt-1 text-[11px] tabular-nums" style={{ color: MUTED }}>
                {semester.semesterCode} · {semester.courses.length} môn · {credits} tín chỉ
              </Text>
            </View>
            {open ? <ChevronUp size={18} color={MUTED} /> : <ChevronDown size={18} color={MUTED} />}
          </View>

          {semester.note ? (
            <Text className="mt-2 text-[12px] leading-[17px]" style={{ color: MUTED }}>
              {semester.note}
            </Text>
          ) : null}
        </Pressable>

        {open ? (
          <View className="mt-2 gap-1.5">
            {semester.courses.length === 0 ? (
              <View
                className="rounded-xl border border-dashed px-4 py-4"
                style={{ borderColor: "#E5E7EB" }}
              >
                <Text className="text-center text-[12px]" style={{ color: MUTED }}>
                  Học kỳ này chưa có môn nào
                </Text>
              </View>
            ) : (
              semester.courses.map((course) => (
                <RoadmapCourseChip
                  key={`${semester.semesterNumber}-${course.courseId}`}
                  course={course}
                  onPress={onCoursePress}
                />
              ))
            )}
          </View>
        ) : null}
      </View>
    </View>
  );
}
