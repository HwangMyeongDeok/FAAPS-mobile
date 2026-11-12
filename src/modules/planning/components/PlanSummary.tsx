import { Text, View } from "react-native";

interface PlanSummaryProps {
  terms: number;
  credits: number;
  awaitingReview: number;
}

/** Three numbers, one divided card. */
export function PlanSummary({ terms, credits, awaitingReview }: PlanSummaryProps) {
  return (
    <View className="px-5 pt-4">
      <View className="flex-row rounded-3xl border border-line bg-surface dark:border-line-dark dark:bg-surface-dark">
        <View className="flex-1 items-center py-4">
          <Text className="text-[11px] font-medium text-ink-muted dark:text-ink-muted-dark">
            Terms
          </Text>
          <Text className="mt-1 text-xl font-bold text-ink tabular-nums dark:text-ink-dark">
            {terms}
          </Text>
        </View>
        <View className="w-px bg-line dark:bg-line-dark" />
        <View className="flex-1 items-center py-4">
          <Text className="text-[11px] font-medium text-ink-muted dark:text-ink-muted-dark">
            Credits
          </Text>
          <Text className="mt-1 text-xl font-bold text-ink tabular-nums dark:text-ink-dark">
            {credits}
          </Text>
        </View>
        <View className="w-px bg-line dark:bg-line-dark" />
        <View className="flex-1 items-center py-4">
          <Text className="text-[11px] font-medium text-ink-muted dark:text-ink-muted-dark">
            Awaiting review
          </Text>
          <Text className="mt-1 text-xl font-bold text-ink tabular-nums dark:text-ink-dark">
            {awaitingReview}
          </Text>
        </View>
      </View>
    </View>
  );
}
