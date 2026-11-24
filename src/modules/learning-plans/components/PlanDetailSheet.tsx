/**
 * PlanDetailSheet — the detail of one course learning plan.
 *
 * Lists the learning tasks as checkboxes. Tapping a checkbox calls
 * `PATCH /api/student/course-learning-plans/{planId}/tasks/{taskId}` and
 * the plan is re-rendered with the task struck through and the progress
 * bar moved forward.
 */
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { Sheet } from "@/components/ui";
import { Progress } from "@/components/ui/progress";
import { useCourseLearningPlan, useToggleCourseLearningTask } from "@/lib/queries/course-learning-plan";
import type { CoursePlanTask } from "@/types/course-learning-plan";
import { ORANGE, ORANGE_DEEP, dueLabel, isOverdue, progressLabel, progressOf } from "../format";

interface PlanDetailSheetProps {
  planId: string | null;
  onClose: () => void;
}

export function PlanDetailSheet({ planId, onClose }: PlanDetailSheetProps) {
  const { data: plan, isLoading, isError, refetch } = useCourseLearningPlan(planId);
  const toggle = useToggleCourseLearningTask();

  const { completed, total, percent } = progressOf(plan?.tasks ?? []);

  return (
    <Sheet open={!!planId} onClose={onClose} maxHeightRatio={0.9}>
      {isLoading ? (
        <View className="items-center py-12">
          <ActivityIndicator color={ORANGE} />
          <Text className="mt-2 text-[12px] text-ink-muted dark:text-ink-muted-dark">
            Loading the plan…
          </Text>
        </View>
      ) : isError || !plan ? (
        <View className="items-center py-10">
          <MaterialCommunityIcons name="cloud-off-outline" size={30} color="#94A3B8" />
          <Text className="mt-2 text-[13px] font-bold text-ink dark:text-ink-dark">
            Could not load this plan
          </Text>
          <Text className="mt-1 text-center text-[12px] text-ink-muted dark:text-ink-muted-dark">
            Check your connection and try again.
          </Text>
          <Pressable
            onPress={() => refetch()}
            accessibilityRole="button"
            accessibilityLabel="Try again"
            className="mt-3 rounded-full px-4 py-2 active:opacity-80"
            style={{ backgroundColor: ORANGE }}
          >
            <Text className="text-[12px] font-bold text-white">Try again</Text>
          </Pressable>
        </View>
      ) : (
        <>
          {/* Header — course + goal */}
          <View className="mt-1">
            <Text className="text-[18px] font-bold text-ink dark:text-ink-dark">
              {plan.header.courseName}
            </Text>
            <Text className="mt-0.5 text-[12px] text-ink-muted tabular-nums dark:text-ink-muted-dark">
              {plan.header.courseCode}
              {plan.header.version > 1 ? ` · version ${plan.header.version}` : ""}
            </Text>
          </View>

          {plan.header.learningGoal ? (
            <View className="mt-3 rounded-2xl px-3.5 py-3" style={{ backgroundColor: "#FFF1E7" }}>
              <Text className="text-[10px] font-bold uppercase" style={{ color: ORANGE_DEEP }}>
                Learning goal
              </Text>
              <Text className="mt-1 text-[12px] leading-[17px] text-ink dark:text-ink-dark">
                {plan.header.learningGoal}
              </Text>
            </View>
          ) : null}

          {/* Progress */}
          <View className="mt-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-[13px] font-bold text-ink dark:text-ink-dark">Progress</Text>
              <Text className="text-[13px] font-bold tabular-nums" style={{ color: ORANGE }}>
                {percent}%
              </Text>
            </View>
            <View className="mt-2">
              <Progress value={percent} color="primary" />
            </View>
            <Text className="mt-1.5 text-[11px] text-ink-muted tabular-nums dark:text-ink-muted-dark">
              {progressLabel(completed, total)}
            </Text>
          </View>

          {/* Tasks */}
          <Text className="mb-2 mt-5 text-[13px] font-bold text-ink dark:text-ink-dark">
            Learning tasks
          </Text>

          {plan.tasks.length === 0 ? (
            <Text className="text-[12px] text-ink-faint dark:text-ink-faint-dark">
              This plan has no tasks yet.
            </Text>
          ) : (
            <View className="overflow-hidden rounded-2xl border border-line dark:border-line-dark">
              {plan.tasks.map((task, index) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  isLast={index === plan.tasks.length - 1}
                  busy={
                    toggle.isPending &&
                    toggle.variables?.planId === plan.header.id &&
                    toggle.variables?.taskId === task.id
                  }
                  onToggle={() =>
                    toggle.mutate({
                      planId: plan.header.id,
                      taskId: task.id,
                      completed: !task.completed,
                    })
                  }
                />
              ))}
            </View>
          )}

          {toggle.isError ? (
            <Text className="mt-3 text-[12px]" style={{ color: "#B91C1C" }}>
              Could not update the task. Please try again.
            </Text>
          ) : null}
        </>
      )}
    </Sheet>
  );
}

/** One task row: checkbox, title, due date. */
function TaskRow({
  task,
  isLast,
  busy,
  onToggle,
}: {
  task: CoursePlanTask;
  isLast: boolean;
  busy: boolean;
  onToggle: () => void;
}) {
  const due = dueLabel(task.dueDate);
  const late = isOverdue(task.dueDate, task.completed);

  return (
    <View
      className="flex-row items-start gap-3 bg-surface px-3.5 py-3 dark:bg-surface-dark"
      style={
        isLast ? undefined : { borderBottomWidth: 1, borderBottomColor: "#E5E7EB" }
      }
    >
      <Pressable
        onPress={onToggle}
        disabled={busy}
        hitSlop={8}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: task.completed, busy }}
        accessibilityLabel={task.title}
        className="mt-0.5 active:opacity-70"
      >
        {busy ? (
          <ActivityIndicator size="small" color={ORANGE} />
        ) : (
          <View
            className="h-[22px] w-[22px] items-center justify-center rounded-[7px] border"
            style={{
              borderColor: task.completed ? ORANGE : "#D1D5DB",
              backgroundColor: task.completed ? ORANGE : "transparent",
            }}
          >
            {task.completed ? (
              <MaterialCommunityIcons name="check" size={15} color="#FFFFFF" />
            ) : null}
          </View>
        )}
      </Pressable>

      <View className="flex-1">
        <Text
          className="text-[13px] leading-[18px]"
          style={{
            color: task.completed ? "#6B7280" : "#1A1A1A",
            fontWeight: task.completed ? "400" : "600",
            textDecorationLine: task.completed ? "line-through" : "none",
          }}
        >
          {task.title}
        </Text>

        {task.description ? (
          <Text className="mt-0.5 text-[11px] leading-[16px] text-ink-muted dark:text-ink-muted-dark">
            {task.description}
          </Text>
        ) : null}

        {due ? (
          <View className="mt-1.5 flex-row items-center gap-1">
            <MaterialCommunityIcons
              name={late ? "alert-circle-outline" : "calendar-blank-outline"}
              size={12}
              color={late ? "#B91C1C" : "#9CA3AF"}
            />
            <Text
              className="text-[11px] tabular-nums"
              style={{ color: late ? "#B91C1C" : "#6B7280" }}
            >
              {due}
              {late ? " · overdue" : ""}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
