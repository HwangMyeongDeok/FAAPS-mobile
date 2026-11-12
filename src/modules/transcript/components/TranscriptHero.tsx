import { Text, View } from "react-native";
import { ORANGE, gpaLabel } from "../format";

interface TranscriptHeroProps {
  cumulativeGpa: number | null;
  courseCount: number;
  earned: number;
  total: number;
}

/** Flat orange hero: cumulative GPA + credit progress. */
export function TranscriptHero({ cumulativeGpa, courseCount, earned, total }: TranscriptHeroProps) {
  const pct = total === 0 ? 0 : Math.min(100, Math.round((earned / total) * 100));
  const left = Math.max(0, total - earned);
  return (
    <View className="px-5 pt-4">
      <View className="overflow-hidden rounded-[28px] p-5" style={{ backgroundColor: ORANGE }}>
        <View
          pointerEvents="none"
          className="absolute -right-14 -top-16 h-48 w-48 rounded-full"
          style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
        />
        <View
          pointerEvents="none"
          className="absolute -bottom-20 -left-12 h-52 w-52 rounded-full"
          style={{ backgroundColor: "rgba(0,0,0,0.08)" }}
        />
        <View className="flex-row items-center gap-2">
          <View className="rounded-full px-3 py-1.5" style={{ backgroundColor: "rgba(255,255,255,0.22)" }}>
            <Text className="text-[11px] font-bold text-white">Cumulative · {courseCount} courses</Text>
          </View>
          <View className="rounded-full px-3 py-1.5" style={{ backgroundColor: "rgba(255,255,255,0.22)" }}>
            <Text className="text-[11px] font-bold text-white">{gpaLabel(cumulativeGpa)}</Text>
          </View>
        </View>
        <View className="mt-4 flex-row items-end justify-between">
          <View>
            <Text className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.85)" }}>
              Cumulative GPA
            </Text>
            <View className="flex-row items-baseline gap-1">
              <Text className="text-[52px] font-bold leading-[56px] text-white tabular-nums">
                {cumulativeGpa != null ? cumulativeGpa.toFixed(2) : "—"}
              </Text>
              <Text className="text-base font-medium" style={{ color: "rgba(255,255,255,0.8)" }}>
                / 10
              </Text>
            </View>
          </View>
          <View className="items-end pb-1">
            <Text className="text-2xl font-bold text-white tabular-nums">
              {earned}
              <Text className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.8)" }}>
                /{total}
              </Text>
            </Text>
            <Text className="text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.85)" }}>
              credits earned
            </Text>
          </View>
        </View>
        <View className="mt-3 h-2.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.3)" }}>
          <View className="h-full rounded-full bg-white" style={{ width: `${pct}%` }} />
        </View>
        <Text className="mt-2 text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.9)" }}>
          {pct}% completed · {left} credits left to graduate
        </Text>
      </View>
    </View>
  );
}
