import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { Badge, Separator, Sheet } from "@/components/ui";
import { useCourseDetail } from "@/lib/queries/course";
import type { CoursePrerequisite } from "@/types/course";
import { categoryBadgeVariant, courseCategoryVisual } from "./CourseTypeIcon";

/**
 * The curriculum-only facts about a course.
 *
 * These live on the curriculum row, not on the course record, so they are
 * passed in separately and rendered above the API detail.
 */
export interface CourseCurriculumMeta {
  /** The semester this course belongs to inside the curriculum. */
  semester: number;
  /** Whether the course is mandatory for the curriculum. */
  mandatory: boolean;
  /** The elective group, when the course belongs to one. */
  groupName: string | null;
  /** Whether the student has already completed the course. */
  completed: boolean;
}

interface CourseDetailSheetProps {
  /** The course id (UUID) — `null` closes the sheet. */
  courseId: string | null;
  onClose: () => void;
  /** Curriculum facts, when the sheet is opened from the curriculum tab. */
  curriculumMeta?: CourseCurriculumMeta;
}

/**
 * Course detail — one sheet, one source of truth.
 *
 * The sheet fetches the full record from `GET /api/student/courses/{id}`,
 * so the description, the objectives, the learning outcomes and the
 * prerequisites are the real ones from the backend. The course catalogue
 * tab and the curriculum tab both open this, so a course reads the same
 * wherever the student meets it.
 */
export function CourseDetailSheet({
  courseId,
  onClose,
  curriculumMeta,
}: CourseDetailSheetProps) {
  const { data: detail, isLoading, isError, refetch } = useCourseDetail(courseId);

  return (
    <Sheet open={!!courseId} onClose={onClose}>
      {isLoading ? (
        <View className="items-center py-10">
          <ActivityIndicator color="#F36F21" />
          <Text className="mt-3 text-[13px] text-ink-muted dark:text-ink-muted-dark">
            Loading the course…
          </Text>
        </View>
      ) : isError ? (
        <View className="items-center py-8">
          <MaterialCommunityIcons
            name="cloud-off-outline"
            size={36}
            color="#CBD5E1"
          />
          <Text className="mt-3 text-center text-sm font-semibold text-ink dark:text-ink-dark">
            Could not load this course
          </Text>
          <Text className="mt-1 text-center text-xs text-ink-muted dark:text-ink-muted-dark">
            The details could not be fetched from the server.
          </Text>
          <Pressable
            onPress={() => refetch()}
            accessibilityRole="button"
            accessibilityLabel="Try again"
            className="mt-4 rounded-full px-5 py-2.5 active:opacity-85"
            style={{ backgroundColor: "#F36F21" }}
          >
            <Text className="text-xs font-bold text-white">Try again</Text>
          </Pressable>
        </View>
      ) : detail ? (
        <CourseDetailContent detail={detail} curriculumMeta={curriculumMeta} />
      ) : (
        <View className="items-center py-8">
          <Text className="text-ink-muted dark:text-ink-muted-dark">
            Course information not found.
          </Text>
        </View>
      )}
    </Sheet>
  );
}

/* ── The detail body ───────────────────────────────────────────────────── */

function CourseDetailContent({
  detail,
  curriculumMeta,
}: {
  detail: NonNullable<ReturnType<typeof useCourseDetail>["data"]>;
  curriculumMeta?: CourseCurriculumMeta;
}) {
  const { course, prerequisites } = detail;
  const cat = courseCategoryVisual(course.category);

  // The prerequisites come as a flat list; the group number tells us which
  // ones are alternatives of each other.
  const groups = groupPrerequisites(prerequisites);

  return (
    <View>
      {/* Header */}
      <View className="flex-row items-start gap-3 mb-4">
        <View
          className="h-12 w-12 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${cat.color}1A` }}
        >
          <MaterialCommunityIcons
            name={cat.iconName as any}
            size={24}
            color={cat.color}
          />
        </View>
        <View className="flex-1">
          <Text
            className="text-lg font-bold text-ink dark:text-ink-dark"
            numberOfLines={2}
          >
            {course.name}
          </Text>
          <Text className="text-sm text-ink-muted dark:text-ink-muted-dark mt-0.5 font-mono">
            {course.code} · {course.credits} credits
          </Text>
        </View>
        <Badge variant={categoryBadgeVariant(course.category)}>{cat.label}</Badge>
      </View>

      {/* Curriculum facts — only present when opened from the curriculum. */}
      {curriculumMeta ? (
        <>
          <Separator className="my-3" />
          <View className="gap-3">
            <InfoRow
              label="Planned semester"
              value={`Semester ${curriculumMeta.semester}`}
            />
            <InfoRow
              label="Status"
              value={curriculumMeta.completed ? "Completed" : "Not completed"}
              tone={curriculumMeta.completed ? "success" : "muted"}
            />
            <InfoRow
              label="Type"
              value={curriculumMeta.mandatory ? "Required" : "Elective"}
            />
            {curriculumMeta.groupName ? (
              <InfoRow label="Elective group" value={curriculumMeta.groupName} />
            ) : null}
          </View>
        </>
      ) : null}

      <Separator className="my-3" />

      {/* Description */}
      {course.description ? (
        <>
          <Text className="text-sm font-semibold text-ink dark:text-ink-dark mb-1">
            Description
          </Text>
          <Text className="text-sm text-ink-muted dark:text-ink-muted-dark mb-3">
            {course.description}
          </Text>
        </>
      ) : null}

      {/* Objectives */}
      {course.objectives ? (
        <>
          <Text className="text-sm font-semibold text-ink dark:text-ink-dark mb-1">
            Objectives
          </Text>
          <Text className="text-sm text-ink-muted dark:text-ink-muted-dark mb-3">
            {course.objectives}
          </Text>
        </>
      ) : null}

      {/* Learning outcomes */}
      {course.learningOutcomes ? (
        <>
          <Text className="text-sm font-semibold text-ink dark:text-ink-dark mb-1">
            Learning outcomes
          </Text>
          <Text className="text-sm text-ink-muted dark:text-ink-muted-dark mb-3">
            {course.learningOutcomes}
          </Text>
        </>
      ) : null}

      <Separator className="my-3" />

      {/* Prerequisites */}
      <Text className="text-sm font-semibold text-ink dark:text-ink-dark mb-2">
        Prerequisites
      </Text>
      {prerequisites.length === 0 ? (
        <View className="flex-row items-center gap-2 mb-3">
          <MaterialCommunityIcons name="check-circle" size={16} color="#10B981" />
          <Text className="text-sm text-emerald-600">
            No prerequisites required.
          </Text>
        </View>
      ) : (
        <View className="gap-2 mb-3">
          {groups.map((group) => (
            <View key={group.groupNo} className="gap-2">
              {group.courses.map((prereq) => (
                <View
                  key={prereq.id}
                  className="flex-row items-center gap-2 bg-raised dark:bg-raised-dark rounded-lg px-3 py-2"
                >
                  <MaterialCommunityIcons
                    name="arrow-up"
                    size={14}
                    color="#64748B"
                  />
                  <Text className="text-sm text-ink dark:text-ink-dark flex-1">
                    {prereq.courseCode} – {prereq.courseName}
                  </Text>
                  {prereq.minimumScore != null ? (
                    <Badge variant="secondary" className="px-1.5 py-0">
                      ≥ {prereq.minimumScore}
                    </Badge>
                  ) : null}
                  {prereq.type === "CO_REQUISITE" ? (
                    <Badge variant="outline" className="px-1.5 py-0">
                      Co-req
                    </Badge>
                  ) : null}
                </View>
              ))}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

/* ── Helpers ────────────────────────────────────────────────────────────── */

/**
 * Group the prerequisites by their group number.
 *
 * The backend documents the semantics: courses in the same group are
 * alternatives (the student needs one of them), while courses in different
 * groups are all required.
 */
function groupPrerequisites(
  prerequisites: CoursePrerequisite[],
): { groupNo: number; courses: CoursePrerequisite[] }[] {
  const map = new Map<number, CoursePrerequisite[]>();
  for (const p of prerequisites) {
    const list = map.get(p.groupNo) ?? [];
    list.push(p);
    map.set(p.groupNo, list);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a - b)
    .map(([groupNo, courses]) => ({ groupNo, courses }));
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
      <Text className="text-sm text-ink-muted dark:text-ink-muted-dark">
        {label}
      </Text>
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
