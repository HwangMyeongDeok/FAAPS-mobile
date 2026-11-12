import { useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/ScreenHeader";
import { ErrorBlock, LoadingBlock } from "@/components/feedback";
import {
  CourseDetailSheet,
  CurriculumLegend,
  CurriculumOverview,
  SemesterBlock,
  useCompletedCourseIds,
  useGroupedCourses,
  type CourseCurriculumMeta,
  type CourseItemData,
} from "@/modules/curriculum";
import { useMyProfile } from "@/lib/queries/profile";

export default function CurriculumScreen() {
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useMyProfile();
  const { groups, isLoading: groupsLoading, isError, refetch: refetchGroups } = useGroupedCourses(
    profile?.currentSemester,
  );
  const completedCodes = useCompletedCourseIds();

  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedCourseMeta, setSelectedCourseMeta] = useState<CourseCurriculumMeta | null>(null);

  const totalCourses = groups.reduce((s, g) => s + g.courses.length, 0);
  const completedCourses = groups.reduce(
    (s, g) => s + g.courses.filter((c) => completedCodes.has(c.code)).length,
    0,
  );
  const totalCredits = groups.reduce((s, g) => s + g.totalCredits, 0);
  const earnedCredits = groups.reduce((s, g) => s + g.earnedCredits, 0);
  const overallPercent = totalCredits === 0 ? 0 : Math.round((earnedCredits / totalCredits) * 100);

  const groupsForView = useMemo(
    () =>
      groups.map((g) => ({
        ...g,
        courses: g.courses.map<CourseItemData>((c) => ({
          id: c.courseId,
          code: c.code,
          name: c.name,
          credits: c.credits,
          semester: c.semesterNumber,
          mandatory: c.mandatory,
          groupName: c.groupName,
          completed: completedCodes.has(c.code),
        })),
      })),
    [groups, completedCodes],
  );

  if (profileLoading || groupsLoading) {
    return (
      <SafeAreaView className="flex-1 bg-ground dark:bg-ground-dark" edges={["top"]}>
        <View className="flex-1 px-4 pt-4">
          <LoadingBlock message="Loading curriculum…" />
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !profile) {
    return (
      <SafeAreaView className="flex-1 bg-ground dark:bg-ground-dark" edges={["top"]}>
        <View className="flex-1 px-4 pt-4">
          <ErrorBlock
            title="Could not load the curriculum"
            message="Check your connection and try again."
            onRetry={() => {
              refetchProfile();
              refetchGroups();
            }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-ground dark:bg-ground-dark" edges={["top"]}>
      <ScreenHeader title="Curriculum" subtitle={`${profile.majorName ?? ""} · ${profile.cohort ?? ""}`} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 40 }}
      >
        <CurriculumOverview
          completedCourses={completedCourses}
          totalCourses={totalCourses}
          earnedCredits={earnedCredits}
          totalCredits={totalCredits}
          overallPercent={overallPercent}
        />
        <CurriculumLegend />

        <Text className="mb-3 px-1 text-sm font-semibold text-ink dark:text-ink-dark">
          Courses by semester
        </Text>
        {groupsForView.map((g) => (
          <SemesterBlock
            key={g.semester}
            semesterNumber={g.semester}
            totalCredits={g.totalCredits}
            earnedCredits={g.earnedCredits}
            status={g.status}
            courses={g.courses}
            onCoursePress={(c) => {
              setSelectedCourseId(c.id);
              setSelectedCourseMeta({
                semester: c.semester,
                mandatory: c.mandatory,
                groupName: c.groupName,
                completed: c.completed,
              });
            }}
          />
        ))}

        <Text className="mt-4 text-center text-xs text-ink-muted dark:text-ink-muted-dark">
          Tap a course to see its details.
        </Text>
      </ScrollView>

      <CourseDetailSheet
        courseId={selectedCourseId}
        curriculumMeta={selectedCourseMeta ?? undefined}
        onClose={() => {
          setSelectedCourseId(null);
          setSelectedCourseMeta(null);
        }}
      />
    </SafeAreaView>
  );
}
