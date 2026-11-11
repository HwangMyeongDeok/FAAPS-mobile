import { useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { Card, CardContent, Progress } from "@/components/ui";
import { ScreenHeader } from "@/components/ScreenHeader";
import {
  SemesterBlock,
  CourseDetailSheet,
  useCompletedCourseIds,
  useCourseLookup,
  useGroupedCourses,
  type CourseItemData,
} from "@/modules/curriculum";
import { useMyProfile } from "@/lib/queries/profile";

export default function CurriculumScreen() {
  const { data: profile, isLoading: profileLoading } = useMyProfile();
  const { groups, isLoading: groupsLoading, isError } = useGroupedCourses(
    profile?.currentSemester,
  );
  const courseLookup = useCourseLookup();
  const completedCodes = useCompletedCourseIds();

  const [selectedCourse, setSelectedCourse] = useState<CourseItemData | null>(
    null,
  );

  const totalCourses = groups.reduce((s, g) => s + g.courses.length, 0);
  const completedCourses = groups.reduce(
    (s, g) => s + g.courses.filter((c) => completedCodes.has(c.code)).length,
    0,
  );
  const totalCredits = groups.reduce((s, g) => s + g.totalCredits, 0);
  const earnedCredits = groups.reduce((s, g) => s + g.earnedCredits, 0);
  const overallPercent =
    totalCredits === 0 ? 0 : Math.round((earnedCredits / totalCredits) * 100);

  // Map the real curriculum rows onto the shape the list components expect.
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
      <SafeAreaView
        className="flex-1 items-center justify-center bg-ground dark:bg-ground-dark"
        edges={["top"]}
      >
        <ActivityIndicator color="#F36F21" />
      </SafeAreaView>
    );
  }

  if (isError || !profile) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center bg-ground dark:bg-ground-dark"
        edges={["top"]}
      >
        <Text className="text-red-500">Could not load the curriculum.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-ground dark:bg-ground-dark"
      edges={["top"]}
    >
      <ScreenHeader
        title="Curriculum"
        subtitle={`${profile.majorName ?? ""} · ${profile.cohort ?? ""}`}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 40,
        }}
      >
        {/* Overview card */}
        <Card className="mb-4 rounded-3xl border-line bg-surface shadow-none dark:border-line-dark dark:bg-surface-dark">
          <CardContent className="p-5">
            <Text className="text-base font-semibold text-ink dark:text-ink-dark mb-3">
              Curriculum overview
            </Text>
            <View className="flex-row gap-3">
              <Stat
                iconName="school"
                label="Courses completed"
                value={`${completedCourses}/${totalCourses}`}
                tone="primary"
              />
              <Stat
                iconName="book-open-page-variant"
                label="Credits earned"
                value={`${earnedCredits}/${totalCredits}`}
                tone="success"
              />
              <Stat
                iconName="trending-up"
                label="Progress"
                value={`${overallPercent}%`}
                tone="warning"
              />
            </View>
            <View className="mt-4">
              <Progress
                value={overallPercent}
                color={
                  overallPercent >= 80
                    ? "success"
                    : overallPercent >= 40
                      ? "primary"
                      : "warning"
                }
              />
            </View>
          </CardContent>
        </Card>

        {/* Legend */}
        <Card className="mb-4 rounded-3xl border-line bg-surface shadow-none dark:border-line-dark dark:bg-surface-dark">
          <CardContent className="p-4 flex-row items-center gap-2 flex-wrap">
            <Text className="text-xs text-ink-muted dark:text-ink-muted-dark mr-1">
              Legend:
            </Text>
            <LegendDot color="#10B981" label="Completed" />
            <LegendDot color="#F59E0B" label="In progress" />
            <LegendDot color="#8B8178" label="Available" />
          </CardContent>
        </Card>

        {/* Semester blocks */}
        <Text className="text-sm font-semibold text-ink dark:text-ink-dark mb-3 px-1">
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
            onCoursePress={(c) => setSelectedCourse(c)}
          />
        ))}

        <Text className="text-center text-xs text-ink-muted dark:text-ink-muted-dark mt-4">
          Tap a course to see its details.
        </Text>
      </ScrollView>

      <CourseDetailSheet
        course={selectedCourse}
        courseLookup={courseLookup}
        onClose={() => setSelectedCourse(null)}
      />
    </SafeAreaView>
  );
}

// ============================================================
// Local helpers
// ============================================================

function Stat({
  iconName,
  label,
  value,
  tone,
}: {
  iconName: string;
  label: string;
  value: string;
  tone: "primary" | "success" | "warning";
}) {
  const color =
    tone === "primary" ? "#F36F21" : tone === "success" ? "#10B981" : "#F59E0B";
  const bg =
    tone === "primary"
      ? "bg-brand-tint dark:bg-brand-tint-dark"
      : tone === "success"
        ? "bg-emerald-100 dark:bg-emerald-900/30"
        : "bg-amber-100 dark:bg-amber-900/30";
  return (
    <View className="flex-1">
      <View className={`h-9 w-9 items-center justify-center rounded-xl ${bg}`}>
        <MaterialCommunityIcons name={iconName as any} size={18} color={color} />
      </View>
      <Text className="text-base font-bold text-ink dark:text-ink-dark mt-2">
        {value}
      </Text>
      <Text
        className="text-xs text-ink-muted dark:text-ink-muted-dark mt-0.5"
        numberOfLines={2}
      >
        {label}
      </Text>
    </View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View className="flex-row items-center gap-1.5">
      <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      <Text className="text-xs text-ink dark:text-ink-dark">{label}</Text>
    </View>
  );
}
