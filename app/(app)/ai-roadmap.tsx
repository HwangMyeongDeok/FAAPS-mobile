/**
 * FE-S-9 — AI suggested curriculum roadmap.
 * Container keeps data hooks; visuals live in `src/modules/ai/components/`.
 */

import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BookOpen, GraduationCap, Sparkles } from "lucide-react-native";
import { router } from "expo-router";

import { AppCard } from "@/components/ui/AppCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonBlock } from "@/components/ui/SkeletonBlock";
import { ErrorBlock } from "@/components/feedback";
import { useAiRoadmap, useRegenerateAiRoadmap } from "@/lib/queries/ai";
import { RoadmapHeader } from "@/modules/ai/components/RoadmapHeader";
import { TermNode } from "@/modules/ai/components/TermNode";

const ROADMAP_PLANS: { goal: string; maxCreditsPerSemester: number; note?: string }[] = [
  { goal: "Graduate on time with a balanced workload", maxCreditsPerSemester: 18 },
  { goal: "Maximise GPA while staying on track", maxCreditsPerSemester: 16 },
  { goal: "Prioritise AI and data courses", maxCreditsPerSemester: 20 },
];

export default function AiRoadmapScreen() {
  const { data: roadmap, isLoading, isError, refetch } = useAiRoadmap();
  const regenerate = useRegenerateAiRoadmap();

  const [focusSemester, setFocusSemester] = useState<number | null>(null);
  const [planIndex, setPlanIndex] = useState(0);

  const currentSemester = useMemo(() => {
    const current = roadmap?.semesters.find((s) => s.status === "IN_PROGRESS");
    return current?.semesterNumber ?? 1;
  }, [roadmap]);

  const onRegenerate = useCallback(() => {
    if (regenerate.isPending) return;
    const next = (planIndex + 1) % ROADMAP_PLANS.length;
    setPlanIndex(next);
    regenerate.mutate(ROADMAP_PLANS[next]);
  }, [planIndex, regenerate]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-ground dark:bg-ground-dark" edges={["top"]}>
        <RoadmapHeader isDark={false} isRegenerating={false} onRegenerate={onRegenerate} />
        <View className="flex-1 px-5 pt-4">
          <View className="flex-row gap-3">
            <SkeletonBlock height={92} radius={16} className="flex-1" />
            <SkeletonBlock height={92} radius={16} className="flex-1" />
          </View>
          <SkeletonBlock height={72} radius={16} className="mt-3" />
          <SkeletonBlock height={84} radius={16} className="mt-4" />
          <SkeletonBlock height={84} radius={16} className="mt-3" />
          <View className="mt-6 items-center">
            <ActivityIndicator color="#F37021" />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1 bg-ground dark:bg-ground-dark" edges={["top"]}>
        <RoadmapHeader isDark={false} isRegenerating={false} onRegenerate={onRegenerate} />
        <View className="flex-1 px-5 pt-4">
          <ErrorBlock
            title="Không tải được lộ trình"
            message="Kiểm tra kết nối và thử lại."
            onRetry={() => refetch()}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (!roadmap) {
    return (
      <SafeAreaView className="flex-1 bg-ground dark:bg-ground-dark" edges={["top"]}>
        <RoadmapHeader
          isDark={false}
          isRegenerating={regenerate.isPending}
          onRegenerate={onRegenerate}
        />
        <View className="flex-1 px-5 pt-4">
          <EmptyState
            icon={<Sparkles size={26} color="#F37021" />}
            title="Chưa có lộ trình"
            message="Để AI sắp xếp các học kỳ còn lại dựa trên tiến độ học tập hiện tại của bạn."
            actionLabel={regenerate.isPending ? "Đang tạo…" : "Tạo lộ trình với AI"}
            onAction={onRegenerate}
          />
        </View>
      </SafeAreaView>
    );
  }

  const remaining = roadmap.semesters.filter((s) => s.status !== "COMPLETED");
  const remainingCredits = remaining.reduce(
    (s, sem) => s + sem.courses.reduce((a, c) => a + c.credits, 0),
    0,
  );
  const completedCredits = remaining.reduce(
    (s, sem) =>
      s +
      sem.courses
        .filter((c) => c.status === "COMPLETED" || c.status === "PASSED")
        .reduce((a, c) => a + c.credits, 0),
    0,
  );
  const progress =
    roadmap.totalCredits === 0
      ? 0
      : Math.round((completedCredits / roadmap.totalCredits) * 100);

  return (
    <SafeAreaView className="flex-1 bg-ground dark:bg-ground-dark" edges={["top"]}>
      <RoadmapHeader
        isDark={false}
        isRegenerating={regenerate.isPending}
        onRegenerate={onRegenerate}
        subtitle={`${remaining.length} kỳ còn lại · ${roadmap.totalCredits} tín chỉ`}
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="px-5 pt-4">
          <View className="flex-row gap-3">
            {/* KPI: graduation */}
            <AppCard className="flex-1">
              <View className="flex-row items-center gap-1.5">
                <GraduationCap size={14} color="#F37021" />
                <Text className="text-[11px]" style={{ color: "#6B7280" }}>
                  Dự kiến tốt nghiệp
                </Text>
              </View>
              <Text className="mt-1.5 text-[19px] tabular-nums" style={{ color: "#1A1A1A", fontWeight: "700" }}>
                {remaining.length} kỳ
              </Text>
              <Text className="mt-0.5 text-[10px]" style={{ color: "#6B7280" }}>
                còn lại · {roadmap.totalSemesters} kỳ tổng
              </Text>
            </AppCard>
            {/* KPI: credits */}
            <AppCard className="flex-1">
              <View className="flex-row items-center gap-1.5">
                <BookOpen size={14} color="#F37021" />
                <Text className="text-[11px]" style={{ color: "#6B7280" }}>
                  Tín chỉ
                </Text>
              </View>
              <Text className="mt-1.5 text-[19px] tabular-nums" style={{ color: "#1A1A1A", fontWeight: "700" }}>
                {remainingCredits}
                <Text className="text-[12px]" style={{ color: "#6B7280" }}>
                  {" "}
                  /{roadmap.totalCredits}
                </Text>
              </Text>
              <Text className="mt-0.5 text-[10px]" style={{ color: "#6B7280" }}>
                đã xong {completedCredits} tín chỉ
              </Text>
            </AppCard>
          </View>
        </View>

        {roadmap.summary ? (
          <View className="px-5 pt-3">
            <View className="flex-row items-start gap-2.5 rounded-2xl px-4 py-3" style={{ backgroundColor: "#FFF1E7" }}>
              <Sparkles size={15} color="#B45309" style={{ marginTop: 1 }} />
              <View className="flex-1">
                <Text className="text-[12px]" style={{ color: "#1A1A1A", fontWeight: "700" }}>
                  Chiến lược của AI
                </Text>
                <Text className="mt-0.5 text-[12px] leading-[17px]" style={{ color: "#6B7280" }}>
                  {roadmap.summary}
                </Text>
              </View>
            </View>
          </View>
        ) : null}

        <View className="px-5 pt-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-[12px]" style={{ color: "#6B7280", fontWeight: "600" }}>
              Tiến độ chương trình
            </Text>
            <Text className="text-[12px] tabular-nums" style={{ color: "#1A1A1A", fontWeight: "700" }}>
              {progress}%
            </Text>
          </View>
          <View
            className="mt-2 h-2 w-full overflow-hidden rounded-full"
            style={{ backgroundColor: "#E5E7EB" }}
          >
            <View
              className="h-full rounded-full"
              style={{ width: `${progress}%`, backgroundColor: "#F37021" }}
            />
          </View>
        </View>

        <View className="px-5 pt-6">
          <Text className="text-[15px]" style={{ color: "#1A1A1A", fontWeight: "700" }}>
            Kế hoạch từng học kỳ
          </Text>
          <Text className="mt-0.5 text-[12px]" style={{ color: "#6B7280" }}>
            {roadmap.semesters.length} học kỳ · chạm để xem môn học
          </Text>

          <View className="mt-4">
            {roadmap.semesters.map((semester, index) => (
              <TermNode
                key={semester.semesterNumber}
                semester={semester}
                isLast={index === roadmap.semesters.length - 1}
                isDark={false}
                open={
                  focusSemester === semester.semesterNumber ||
                  (focusSemester === null && semester.semesterNumber === currentSemester)
                }
                onToggle={() =>
                  setFocusSemester((prev) =>
                    prev === semester.semesterNumber ? null : semester.semesterNumber,
                  )
                }
                onCoursePress={() => router.push("/(app)/(tabs)/courses")}
              />
            ))}
          </View>
        </View>

        {regenerate.isPending ? (
          <View className="absolute inset-0 items-center justify-center bg-ground/70 dark:bg-ground-dark/70">
            <View className="items-center rounded-2xl border border-[#E5E7EB] bg-white px-7 py-6">
              <ActivityIndicator color="#F37021" />
              <Text className="mt-3 text-[13px]" style={{ color: "#1A1A1A", fontWeight: "700" }}>
                AI đang tính lại…
              </Text>
              <Text className="mt-1 text-center text-[11px]" style={{ color: "#6B7280" }}>
                Tối ưu thứ tự môn học theo ràng buộc mới
              </Text>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
