import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import type { CurriculumCourse, CurriculumPlan, PlanSemester } from "@/types";
import { ORANGE, type EditorCourseRow } from "../format";

interface EditorSheetProps {
  semester: PlanSemester;
  plan: CurriculumPlan | null;
  curriculum: CurriculumCourse[];
  query: string;
  onQuery: (q: string) => void;
  isDark: boolean;
  saving: boolean;
  onClose: () => void;
  onSave: (courseIds: string[]) => void;
}

/** The course picker: selected list, search, candidates, save draft. */
export function EditorSheet({
  semester,
  plan,
  curriculum,
  query,
  onQuery,
  isDark,
  saving,
  onClose,
  onSave,
}: EditorSheetProps) {
  const [selected, setSelected] = useState<string[]>(() =>
    plan?.courses.map((c) => c.id) ?? [],
  );

  const lookup = useMemo(() => {
    const m = new Map<string, EditorCourseRow>();
    for (const c of curriculum) {
      m.set(c.courseId, {
        courseId: c.courseId,
        code: c.code,
        name: c.name,
        credits: c.credits,
        semesterNumber: c.semesterNumber,
        mandatory: c.mandatory,
      });
    }
    for (const c of plan?.courses ?? []) {
      if (!m.has(c.id)) {
        m.set(c.id, {
          courseId: c.id,
          code: c.code,
          name: c.name,
          credits: c.credits,
          semesterNumber: 0,
          mandatory: false,
        });
      }
    }
    return m;
  }, [curriculum, plan]);

  const candidates = useMemo(() => {
    const q = query.trim().toLowerCase();
    return curriculum
      .filter((c) => !selected.includes(c.courseId))
      .filter((c) =>
        q
          ? c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
          : true,
      );
  }, [curriculum, selected, query]);

  const selectedCourses = useMemo(
    () =>
      selected.map((id) => lookup.get(id)).filter((c): c is EditorCourseRow => !!c),
    [selected, lookup],
  );

  const totalCredits = selectedCourses.reduce((s, c) => s + c.credits, 0);

  const toggle = (course: EditorCourseRow) => {
    setSelected((prev) =>
      prev.includes(course.courseId)
        ? prev.filter((id) => id !== course.courseId)
        : [...prev, course.courseId],
    );
  };

  return (
    <View>
      <Text className="text-lg font-bold text-ink dark:text-ink-dark">
        Plan {semester.name}
      </Text>
      <Text className="mt-1 text-[13px] text-ink-muted dark:text-ink-muted-dark">
        Pick the courses you want to register for this term.
      </Text>

      {selectedCourses.length > 0 ? (
        <View className="mt-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-[12px] font-bold text-ink dark:text-ink-dark">
              Selected
            </Text>
            <Text className="text-[12px] text-ink-muted tabular-nums dark:text-ink-muted-dark">
              {selectedCourses.length} courses · {totalCredits} credits
            </Text>
          </View>

          <View className="mt-2 gap-2">
            {selectedCourses.map((c) => (
              <View
                key={c.courseId}
                className="flex-row items-center gap-3 rounded-2xl border border-line bg-surface px-3.5 py-3 dark:border-line-dark dark:bg-surface-dark"
              >
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-[11px] font-bold" style={{ color: "#B5460D" }}>
                      {c.code}
                    </Text>
                    <Text className="text-[11px] text-ink-faint tabular-nums dark:text-ink-faint-dark">
                      {c.credits} cr
                    </Text>
                    {c.mandatory ? (
                      <View
                        className="rounded-full px-2 py-0.5"
                        style={{ backgroundColor: isDark ? "#2E1C0E" : "#FFF1E7" }}
                      >
                        <Text
                          className="text-[10px] font-bold"
                          style={{ color: isDark ? "#FFA371" : "#B5460D" }}
                        >
                          REQUIRED
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <Text
                    className="mt-0.5 text-[13px] font-semibold text-ink dark:text-ink-dark"
                    numberOfLines={2}
                  >
                    {c.name}
                  </Text>
                </View>
                <Pressable
                  onPress={() => toggle(c)}
                  hitSlop={12}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${c.code} from the plan`}
                  className="h-10 w-10 items-center justify-center rounded-full active:opacity-70"
                  style={{ backgroundColor: isDark ? "#241F1B" : "#F2EDE7" }}
                >
                  <MaterialCommunityIcons name="close" size={18} color="#B5460D" />
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <View className="mt-4 flex-row items-center gap-2 rounded-2xl border border-line bg-surface px-3 py-2.5 dark:border-line-dark">
        <MaterialCommunityIcons name="magnify" size={18} color="#8B8178" />
        <TextInput
          value={query}
          onChangeText={onQuery}
          placeholder="Search by course code or name…"
          placeholderTextColor="#8B8178"
          autoCapitalize="none"
          autoCorrect={false}
          className="flex-1 text-sm text-ink dark:text-ink-dark"
        />
        {query.length > 0 ? (
          <Pressable onPress={() => onQuery("")} hitSlop={8}>
            <MaterialCommunityIcons name="close-circle" size={18} color="#8B8178" />
          </Pressable>
        ) : null}
      </View>

      {candidates.length === 0 ? (
        <View className="items-center py-8">
          <MaterialCommunityIcons name="book-search-outline" size={38} color="#CBD5E1" />
          <Text className="mt-3 text-center text-[13px] text-ink-muted dark:text-ink-muted-dark">
            {curriculum.length === 0
              ? "Your curriculum is not available yet."
              : "No other course matches your search."}
          </Text>
        </View>
      ) : (
        <View className="mt-3 gap-2">
          {candidates.map((c) => (
            <Pressable
              key={c.courseId}
              onPress={() =>
                toggle({
                  courseId: c.courseId,
                  code: c.code,
                  name: c.name,
                  credits: c.credits,
                  semesterNumber: c.semesterNumber,
                  mandatory: c.mandatory,
                })
              }
              accessibilityRole="button"
              accessibilityLabel={`Add ${c.code} to the plan`}
              className="flex-row items-center gap-3 rounded-2xl border border-line px-3.5 py-3 active:opacity-70 dark:border-line-dark"
            >
              <View className="flex-1">
                <View className="flex-row items-center gap-2">
                  <Text className="text-[11px] font-bold" style={{ color: "#B5460D" }}>
                    {c.code}
                  </Text>
                  <Text className="text-[11px] text-ink-faint tabular-nums dark:text-ink-faint-dark">
                    {c.credits} cr
                  </Text>
                  {c.semesterNumber ? (
                    <Text className="text-[11px] text-ink-faint dark:text-ink-faint-dark">
                      · term {c.semesterNumber}
                    </Text>
                  ) : null}
                </View>
                <Text
                  className="mt-0.5 text-[13px] font-semibold text-ink dark:text-ink-dark"
                  numberOfLines={2}
                >
                  {c.name}
                </Text>
              </View>
              <View
                className="h-9 w-9 items-center justify-center rounded-full"
                style={{ backgroundColor: ORANGE }}
              >
                <MaterialCommunityIcons name="plus" size={18} color="#fff" />
              </View>
            </Pressable>
          ))}
        </View>
      )}

      <Pressable
        onPress={() => onSave(selected)}
        disabled={saving || selected.length === 0}
        accessibilityRole="button"
        accessibilityLabel="Save the plan draft"
        className="mt-4 flex-row items-center justify-center gap-2 rounded-2xl py-4 active:opacity-85"
        style={{ backgroundColor: ORANGE, opacity: saving || selected.length === 0 ? 0.5 : 1 }}
      >
        {saving ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            <MaterialCommunityIcons name="content-save-outline" size={17} color="#fff" />
            <Text className="text-sm font-bold text-white">Save draft</Text>
          </>
        )}
      </Pressable>

      <Pressable
        onPress={onClose}
        className="mt-2 items-center rounded-2xl bg-raised py-4 active:opacity-80 dark:bg-raised-dark"
      >
        <Text className="text-sm font-bold text-ink dark:text-ink-dark">Cancel</Text>
      </Pressable>
    </View>
  );
}
