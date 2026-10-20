import { useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { Card, CardContent, Progress, Separator } from "@/components/ui";
import { ScreenHeader } from "@/components/ScreenHeader";
import {
  CourseDetailSheet,
  SemesterBlock,
  useCourseLookup,
  useGroupedCourses,
  type CourseItemData,
} from "@/modules/curriculum";
import { useMyProfile } from "@/lib/queries/profile";
import { useAuthStore } from "@/stores/auth";

export default function CurriculumScreen() {
  const userId = useAuthStore((s) => s.session?.user.id ?? null);
  const { data: profile, isLoading: profileLoading } = useMyProfile(userId);
  const { groups, isLoading: groupsLoading, isError } = useGroupedCourses();
  const courseLookup = useCourseLookup();

  const [selectedCourse, setSelectedCourse] = useState<CourseItemData | null>(null);

  if (profileLoading || groupsLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background" edges={["top"]}>
        <ActivityIndicator color="hsl(20 90% 53%)" />
      </SafeAreaView>
    );
  }

  if (isError || !profile) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background" edges={["top"]}>
        <Text className="text-destructive">Không tải được chương trình học.</Text>
      </SafeAreaView>
    );
  }

  const totalCourses = groups.reduce((s, g) => s + g.courses.length, 0);
  const completedCourses = groups.reduce(
    (s, g) => s + g.courses.filter((c) => c.completed).length,
    0
  );
  const totalCredits = groups.reduce((s, g) => s + g.totalCredits, 0);
  const earnedCredits = groups.reduce((s, g) => s + g.earnedCredits, 0);
  const overallPercent = totalCredits === 0 ? 0 : Math.round((earnedCredits / totalCredits) * 100);

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900" edges={["top"]}>
      <ScreenHeader
        title="Chương trình khung"
        subtitle={profile.curriculum_version.name}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 40 }}
      >
        {/* Overview card */}
        <Card className="mb-4">
          <CardContent className="p-5">
            <Text className="text-base font-semibold text-foreground mb-3">
              Tổng quan chương trình
            </Text>
            <View className="flex-row gap-3">
              <Stat
                iconName="school"
                label="Môn đã hoàn thành"
                value={`${completedCourses}/${totalCourses}`}
                tone="primary"
              />
              <Stat
                iconName="book-open-page-variant"
                label="Tín chỉ tích lũy"
                value={`${earnedCredits}/${totalCredits}`}
                tone="success"
              />
              <Stat
                iconName="trending-up"
                label="Tiến độ"
                value={`${overallPercent}%`}
                tone="warning"
              />
            </View>
            <View className="mt-4">
              <Progress
                value={overallPercent}
                color={overallPercent >= 80 ? "success" : overallPercent >= 40 ? "primary" : "warning"}
              />
            </View>
          </CardContent>
        </Card>

        {/* Legend */}
        <Card className="mb-4">
          <CardContent className="p-4 flex-row items-center gap-2 flex-wrap">
            <Text className="text-xs text-muted-foreground mr-1">Chú thích:</Text>
            <LegendDot color="#10B981" label="Hoàn thành" />
            <LegendDot color="#F59E0B" label="Đang học" />
            <LegendDot color="#94A3B8" label="Sẵn sàng" />
          </CardContent>
        </Card>

        {/* Semester blocks */}
        <Text className="text-sm font-semibold text-foreground mb-3 px-1">
          Danh sách môn theo kỳ
        </Text>
        {groups.map((g) => (
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

        <Text className="text-center text-xs text-muted-foreground mt-4">
          Nhấn vào mỗi môn để xem chi tiết & điều kiện tiên quyết.
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
  const color = tone === "primary" ? "#F36F21" : tone === "success" ? "#10B981" : "#F59E0B";
  const bg =
    tone === "primary" ? "bg-primary/10" : tone === "success" ? "bg-emerald-100" : "bg-amber-100";
  return (
    <View className="flex-1">
      <View className={`h-9 w-9 items-center justify-center rounded-lg ${bg}`}>
        <MaterialCommunityIcons name={iconName as any} size={18} color={color} />
      </View>
      <Text className="text-base font-bold text-foreground mt-2">{value}</Text>
      <Text className="text-xs text-muted-foreground mt-0.5" numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View className="flex-row items-center gap-1.5">
      <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      <Text className="text-xs text-foreground">{label}</Text>
    </View>
  );
}
