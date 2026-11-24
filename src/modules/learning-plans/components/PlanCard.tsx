/**
 * PlanCard — one course learning plan in the list.
 *
 * DESIGN:
 * - Card trắng #FFFFFF, bo góc 16px, viền #E5E7EB, shadow nhẹ.
 * - Cam FPT #F37021 làm accent duy nhất.
 */
import { Pressable, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { AppBadge } from "@/components/ui/AppBadge";
import { AppCard } from "@/components/ui/AppCard";
import { Progress } from "@/components/ui/progress";
import type { CourseLearningPlan } from "@/types/course-learning-plan";
import { ORANGE, progressLabel, progressOf } from "../format";

interface PlanCardProps {
  plan: CourseLearningPlan;
  onPress: () => void;
}

export function PlanCard({ plan, onPress }: PlanCardProps) {
  const { header, tasks } = plan;
  const { completed, total, percent } = progressOf(tasks);
  const isDone = total > 0 && completed === total;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open the learning plan for ${header.courseName}`}
      className="active:opacity-80"
    >
      <AppCard className="p-4">
        <View className="flex-row items-start gap-3">
          {/* Course code block — the orange anchor of the card. */}
          <View
            className="h-11 w-11 items-center justify-center rounded-xl"
            style={{ backgroundColor: "#FFF1E7" }}
          >
            <Text className="text-[13px]" style={{ color: ORANGE, fontWeight: "700" }}>
              {header.courseCode}
            </Text>
          </View>

          <View className="flex-1">
            <Text
              className="text-[15px] font-bold text-ink dark:text-ink-dark"
              numberOfLines={1}
            >
              {header.courseName}
            </Text>
            {header.learningGoal ? (
              <Text
                className="mt-1 text-[12px] leading-[17px] text-ink-muted dark:text-ink-muted-dark"
                numberOfLines={2}
              >
                {header.learningGoal}
              </Text>
            ) : (
              <Text className="mt-1 text-[12px] text-ink-faint dark:text-ink-faint-dark">
                No learning goal yet
              </Text>
            )}
          </View>

          <AppBadge
            label={isDone ? "Done" : `${percent}%`}
            tone={isDone ? "success" : percent > 0 ? "primary" : "neutral"}
          />
        </View>

        <View className="mt-3.5">
          <Progress value={percent} color="primary" />
        </View>

        <View className="mt-2 flex-row items-center justify-between">
          <Text className="text-[11px] text-ink-muted tabular-nums dark:text-ink-muted-dark">
            {progressLabel(completed, total)}
          </Text>
          <View className="flex-row items-center gap-1">
            <Text className="text-[11px] text-ink-faint dark:text-ink-faint-dark">
              Open plan
            </Text>
            <MaterialCommunityIcons name="chevron-right" size={14} color="#9CA3AF" />
          </View>
        </View>
      </AppCard>
    </Pressable>
  );
}
