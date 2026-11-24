/**
 * CreatePlanSheet — the "+" flow.
 *
 * The student picks a course from the catalogue, writes a learning goal
 * and lists the learning tasks. The backend needs at least one task, so
 * the sheet refuses to submit an empty list.
 */
import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { AppButton } from "@/components/ui/AppButton";
import { Sheet } from "@/components/ui";
import { useCourses } from "@/lib/queries/course";
import { useCreateCourseLearningPlan } from "@/lib/queries/course-learning-plan";
import { useDebounce } from "@/modules/courses";
import type { CoursePlanTaskInput } from "@/types/course-learning-plan";
import { ORANGE, ORANGE_DEEP } from "../format";

interface CreatePlanSheetProps {
  open: boolean;
  onClose: () => void;
  /** Called after the plan was created — the caller opens the detail. */
  onCreated?: (planId: string) => void;
}

export function CreatePlanSheet({ open, onClose, onCreated }: CreatePlanSheetProps) {
  const [search, setSearch] = useState("");
  const [courseId, setCourseId] = useState<string | null>(null);
  const [goal, setGoal] = useState("");
  const [taskTitles, setTaskTitles] = useState<string[]>([""]);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 300);
  const params = useMemo(
    () => ({ search: debouncedSearch || undefined, size: 20 }),
    [debouncedSearch],
  );
  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } = useCourses(params);
  const courses = useMemo(() => data?.pages.flatMap((p) => p) ?? [], [data]);

  const createPlan = useCreateCourseLearningPlan();

  const reset = () => {
    setSearch("");
    setCourseId(null);
    setGoal("");
    setTaskTitles([""]);
    setError(null);
  };

  const close = () => {
    reset();
    onClose();
  };

  const setTaskAt = (index: number, value: string) => {
    setTaskTitles((prev) => prev.map((t, i) => (i === index ? value : t)));
  };

  const addTask = () => setTaskTitles((prev) => [...prev, ""]);

  const removeTask = (index: number) =>
    setTaskTitles((prev) => prev.filter((_, i) => i !== index));

  const handleCreate = () => {
    const tasks: CoursePlanTaskInput[] = taskTitles
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .map((title) => ({ title }));

    if (!courseId) {
      setError("Pick a course first.");
      return;
    }
    if (tasks.length === 0) {
      setError("Add at least one learning task.");
      return;
    }
    if (tasks.length > 100) {
      setError("A plan can have at most 100 tasks.");
      return;
    }

    setError(null);
    createPlan.mutate(
      { courseId, learningGoal: goal.trim() || null, tasks },
      {
        onSuccess: (plan) => {
          const newId = plan.header.id;
          close();
          onCreated?.(newId);
        },
        onError: (e) => {
          const message =
            e instanceof Error ? e.message : "Could not create the plan. Please try again.";
          setError(message);
        },
      },
    );
  };

  return (
    <Sheet open={open} onClose={close} maxHeightRatio={0.92}>
      <Text className="mt-1 text-[18px] font-bold text-ink dark:text-ink-dark">
        New learning plan
      </Text>
      <Text className="mt-1 text-[12px] leading-[17px] text-ink-muted dark:text-ink-muted-dark">
        Pick a course, set your goal and break it into learning tasks.
      </Text>

      {/* Course picker */}
      <Text className="mb-2 mt-5 text-[13px] font-bold text-ink dark:text-ink-dark">Course</Text>

      <View className="flex-row items-center gap-2 rounded-2xl border border-line bg-surface px-3 py-2.5 dark:border-line-dark dark:bg-surface-dark">
        <MaterialCommunityIcons name="magnify" size={18} color="#9CA3AF" />
        <TextInput
          className="flex-1 text-[13px] text-ink dark:text-ink-dark"
          placeholder="Search by course code or name..."
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {search.length > 0 ? (
          <Pressable onPress={() => setSearch("")} hitSlop={8} className="active:opacity-60">
            <MaterialCommunityIcons name="close-circle" size={16} color="#9CA3AF" />
          </Pressable>
        ) : null}
      </View>

      {/* The sheet's own scroll view carries the whole form, so the course
          list is a plain block — no nested vertical scrollers. */}
      <View className="mt-2">
        {isLoading ? (
          <View className="items-center py-6">
            <ActivityIndicator color={ORANGE} />
          </View>
        ) : courses.length === 0 ? (
          <Text className="py-4 text-center text-[12px] text-ink-faint dark:text-ink-faint-dark">
            No course matches your search.
          </Text>
        ) : (
          <View>
            {courses.map((c) => {
              const selected = c.id === courseId;
              return (
                <Pressable
                  key={c.id}
                  onPress={() => setCourseId(c.id)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  className="flex-row items-center gap-3 border-b border-line py-3 active:opacity-70 dark:border-line-dark"
                >
                  <View
                    className="h-9 w-9 items-center justify-center rounded-xl"
                    style={{ backgroundColor: selected ? ORANGE : "#F3F4F6" }}
                  >
                    <Text
                      className="text-[11px]"
                      style={{ color: selected ? "#FFFFFF" : "#6B7280", fontWeight: "700" }}
                    >
                      {c.code.slice(0, 4)}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-[13px] font-semibold text-ink dark:text-ink-dark"
                      numberOfLines={1}
                    >
                      {c.name}
                    </Text>
                    <Text className="text-[11px] tabular-nums text-ink-faint dark:text-ink-faint-dark">
                      {c.code} · {c.credits} cr
                    </Text>
                  </View>
                  {selected ? (
                    <MaterialCommunityIcons name="check-circle" size={18} color={ORANGE} />
                  ) : null}
                </Pressable>
              );
            })}
            {hasNextPage ? (
              <Pressable
                onPress={() => fetchNextPage()}
                className="items-center py-3 active:opacity-70"
                accessibilityRole="button"
                accessibilityLabel="Load more courses"
              >
                <Text className="text-[12px] font-semibold" style={{ color: ORANGE_DEEP }}>
                  {isFetchingNextPage ? "Loading…" : "Load more"}
                </Text>
              </Pressable>
            ) : null}
          </View>
        )}
      </View>

      {/* Goal */}
      <Text className="mb-2 mt-5 text-[13px] font-bold text-ink dark:text-ink-dark">
        Learning goal
      </Text>
      <TextInput
        className="rounded-2xl border border-line bg-surface px-3.5 py-3 text-[13px] text-ink dark:border-line-dark dark:bg-surface-dark"
        placeholder="What do you want to achieve in this course?"
        placeholderTextColor="#9CA3AF"
        value={goal}
        onChangeText={setGoal}
        multiline
        numberOfLines={3}
        style={{ minHeight: 84, textAlignVertical: "top" }}
      />

      {/* Tasks */}
      <View className="mb-2 mt-5 flex-row items-center justify-between">
        <Text className="text-[13px] font-bold text-ink dark:text-ink-dark">Learning tasks</Text>
        <Text className="text-[11px] tabular-nums text-ink-faint dark:text-ink-faint-dark">
          {taskTitles.filter((t) => t.trim().length > 0).length}/100
        </Text>
      </View>

      <View className="gap-2">
        {taskTitles.map((title, index) => (
          <View key={index} className="flex-row items-center gap-2">
            <TextInput
              className="flex-1 rounded-xl border border-line bg-surface px-3 py-2.5 text-[13px] text-ink dark:border-line-dark dark:bg-surface-dark"
              placeholder={`Task ${index + 1}`}
              placeholderTextColor="#9CA3AF"
              value={title}
              onChangeText={(v) => setTaskAt(index, v)}
              autoCapitalize="sentences"
            />
            {taskTitles.length > 1 ? (
              <Pressable
                onPress={() => removeTask(index)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={`Remove task ${index + 1}`}
                className="active:opacity-60"
              >
                <MaterialCommunityIcons name="close-circle" size={18} color="#9CA3AF" />
              </Pressable>
            ) : null}
          </View>
        ))}
      </View>

      <Pressable
        onPress={addTask}
        disabled={taskTitles.length >= 100}
        accessibilityRole="button"
        accessibilityLabel="Add a task"
        className="mt-3 flex-row items-center gap-1.5 self-start rounded-full border border-line px-3 py-2 active:opacity-70 dark:border-line-dark"
      >
        <MaterialCommunityIcons name="plus" size={15} color={ORANGE} />
        <Text className="text-[12px] font-semibold" style={{ color: ORANGE }}>
          Add task
        </Text>
      </Pressable>

      {error ? (
        <Text className="mt-4 text-[12px]" style={{ color: "#B91C1C" }}>
          {error}
        </Text>
      ) : null}

      <View className="mt-6 flex-row gap-3">
        <View className="flex-1">
          <AppButton label="Cancel" variant="outline" onPress={close} />
        </View>
        <View className="flex-1">
          <AppButton
            label="Create plan"
            onPress={handleCreate}
            loading={createPlan.isPending}
          />
        </View>
      </View>
    </Sheet>
  );
}
