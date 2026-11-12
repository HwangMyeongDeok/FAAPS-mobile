import { Pressable, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { cardShadow } from "@/lib/shadow";
import type { TranscriptRow } from "@/types";
import { gradeTone, type TranscriptSemester } from "../format";

export function SemesterOverview({ semesters }: { semesters: { code: string; name: string; creditsEnrolled: number; creditsEarned: number; semesterGpa: number | null }[] }) {
  if (semesters.length === 0) return null;
  return (
    <View className="px-5 pt-4">
      <View className="rounded-3xl border border-line bg-surface p-4 dark:border-line-dark dark:bg-surface-dark">
        <Text className="text-[13px] font-bold text-ink dark:text-ink-dark">Semester overview</Text>
        <View className="mt-3 gap-2.5">
          {semesters.map((s) => (
            <View key={s.code} className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-xs font-semibold text-ink dark:text-ink-dark">{s.name}</Text>
                <Text className="text-[11px] text-ink-muted dark:text-ink-muted-dark">
                  {s.creditsEarned}/{s.creditsEnrolled} credits
                </Text>
              </View>
              <Text className="text-[13px] font-bold tabular-nums text-ink dark:text-ink-dark">
                {s.semesterGpa != null ? s.semesterGpa.toFixed(2) : "—"}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

interface SemesterCardProps {
  semester: TranscriptSemester;
  isDark: boolean;
  open: boolean;
  onToggle: () => void;
}

export function SemesterCard({ semester, isDark, open, onToggle }: SemesterCardProps) {
  const tone = gradeTone(semester.gpa, isDark);
  return (
    <View
      className="overflow-hidden rounded-3xl border border-line bg-surface dark:border-line-dark dark:bg-surface-dark"
      style={cardShadow(isDark)}
    >
      <Pressable
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityLabel={`${open ? "Collapse" : "Expand"} ${semester.label} results`}
        className="flex-row items-center gap-3 p-4 active:opacity-80"
      >
        <View
          className="h-11 w-11 items-center justify-center rounded-2xl"
          style={{ backgroundColor: isDark ? "#241F1B" : "#F2EDE7" }}
        >
          <MaterialCommunityIcons
            name="calendar-month-outline"
            size={22}
            color={isDark ? "#FFA371" : "#F36F21"}
          />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-bold text-ink dark:text-ink-dark">{semester.label}</Text>
          <Text className="mt-0.5 text-[11px] text-ink-muted dark:text-ink-muted-dark">
            {semester.rows.length} courses · {semester.credits} credits
          </Text>
        </View>
        <View className="rounded-full px-3 py-1.5" style={{ backgroundColor: tone.bg }}>
          <Text className="text-[12px] font-bold tabular-nums" style={{ color: tone.fg }}>
            {semester.gpa != null ? semester.gpa.toFixed(2) : "—"}
          </Text>
        </View>
        <MaterialCommunityIcons
          name={open ? "chevron-up" : "chevron-down"}
          size={20}
          color={isDark ? "#A79C93" : "#8B8178"}
        />
      </Pressable>
      {open ? (
        <View className="px-4 pb-2">
          <View className="h-px bg-rule dark:bg-rule-dark" />
          {semester.rows.map((c, i) => (
            <CourseRow key={c.id} course={c} isDark={isDark} last={i === semester.rows.length - 1} />
          ))}
          <View className="flex-row items-center justify-between py-3">
            <Text className="text-[11px] font-medium text-ink-muted dark:text-ink-muted-dark">
              Semester GPA · {semester.label}
            </Text>
            <Text className="text-[13px] font-bold tabular-nums" style={{ color: tone.fg }}>
              {semester.gpa != null ? semester.gpa.toFixed(2) : "—"}
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

export function CourseRow({ course, isDark, last }: { course: TranscriptRow; isDark: boolean; last: boolean }) {
  const tone = gradeTone(course.finalScore, isDark);
  const failed = course.status === "FAILED";
  return (
    <View className={`flex-row items-center gap-3 py-3 ${last ? "" : "border-b border-rule dark:border-rule-dark"}`}>
      <View className="flex-1">
        <View className="flex-row items-center gap-2">
          <Text className="text-[13px] font-bold text-ink dark:text-ink-dark tabular-nums">
            {course.courseCode}
          </Text>
          {failed ? (
            <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: tone.bg }}>
              <Text className="text-[10px] font-bold" style={{ color: tone.fg }}>
                FAILED
              </Text>
            </View>
          ) : null}
          {course.attemptNumber > 1 ? (
            <View className="rounded-full bg-raised px-2 py-0.5 dark:bg-raised-dark">
              <Text className="text-[10px] font-bold text-ink-muted dark:text-ink-muted-dark">
                Attempt {course.attemptNumber}
              </Text>
            </View>
          ) : null}
        </View>
        <Text className="mt-0.5 text-[12px] leading-4 text-ink-muted dark:text-ink-muted-dark" numberOfLines={2}>
          {course.courseName}
        </Text>
        <Text className="mt-0.5 text-[11px] text-ink-faint dark:text-ink-faint-dark tabular-nums">
          {course.credits} credits
        </Text>
      </View>
      <View className="min-w-[56px] items-center rounded-2xl px-2.5 py-2" style={{ backgroundColor: tone.bg }}>
        <Text className="text-[15px] font-bold tabular-nums" style={{ color: tone.fg }}>
          {course.finalScore != null ? course.finalScore.toFixed(1) : "—"}
        </Text>
      </View>
    </View>
  );
}
