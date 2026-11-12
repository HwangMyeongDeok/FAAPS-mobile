import { Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { Card, CardContent, Progress } from "@/components/ui";

interface StatProps {
  iconName: string;
  label: string;
  value: string;
  tone: "primary" | "success" | "warning";
}

/** One stat tile inside the overview card. */
export function CurriculumStat({ iconName, label, value, tone }: StatProps) {
  const color = tone === "primary" ? "#F36F21" : tone === "success" ? "#10B981" : "#F59E0B";
  const bg =
    tone === "primary"
      ? "bg-brand-tint dark:bg-brand-tint-dark"
      : tone === "success"
        ? "bg-emerald-100 dark:bg-emerald-900/30"
        : "bg-amber-100 dark:bg-amber-900/30";
  return (
    <View className="flex-1">
      <View className={`h-9 w-9 items-center justify-center rounded-xl ${bg}`}>
        <MaterialCommunityIcons name={iconName as never} size={18} color={color} />
      </View>
      <Text className="mt-2 text-base font-bold tabular-nums text-ink dark:text-ink-dark">{value}</Text>
      <Text className="mt-0.5 text-xs text-ink-muted dark:text-ink-muted-dark" numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

/** Small coloured dot + label for the legend card. */
export function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View className="flex-row items-center gap-1.5">
      <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      <Text className="text-xs text-ink dark:text-ink-dark">{label}</Text>
    </View>
  );
}

interface OverviewProps {
  completedCourses: number;
  totalCourses: number;
  earnedCredits: number;
  totalCredits: number;
  overallPercent: number;
}

/** Curriculum overview card: three stats + progress bar. */
export function CurriculumOverview({
  completedCourses,
  totalCourses,
  earnedCredits,
  totalCredits,
  overallPercent,
}: OverviewProps) {
  return (
    <Card className="mb-4 rounded-3xl border-line bg-surface shadow-none dark:border-line-dark dark:bg-surface-dark">
      <CardContent className="p-5">
        <Text className="mb-3 text-base font-semibold text-ink dark:text-ink-dark">
          Curriculum overview
        </Text>
        <View className="flex-row gap-3">
          <CurriculumStat iconName="school" label="Courses completed" value={`${completedCourses}/${totalCourses}`} tone="primary" />
          <CurriculumStat iconName="book-open-page-variant" label="Credits earned" value={`${earnedCredits}/${totalCredits}`} tone="success" />
          <CurriculumStat iconName="trending-up" label="Progress" value={`${overallPercent}%`} tone="warning" />
        </View>
        <View className="mt-4">
          <Progress
            value={overallPercent}
            color={overallPercent >= 80 ? "success" : overallPercent >= 40 ? "primary" : "warning"}
          />
        </View>
      </CardContent>
    </Card>
  );
}

/** Legend card explaining the status dots. */
export function CurriculumLegend() {
  return (
    <Card className="mb-4 rounded-3xl border-line bg-surface shadow-none dark:border-line-dark dark:bg-surface-dark">
      <CardContent className="flex-row flex-wrap items-center gap-2 p-4">
        <Text className="mr-1 text-xs text-ink-muted dark:text-ink-muted-dark">Legend:</Text>
        <LegendDot color="#10B981" label="Completed" />
        <LegendDot color="#F59E0B" label="In progress" />
        <LegendDot color="#8B8178" label="Available" />
      </CardContent>
    </Card>
  );
}
