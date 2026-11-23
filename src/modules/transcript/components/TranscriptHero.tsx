import { Text, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import { gpaLabel } from "../format";

interface TranscriptHeroProps {
  cumulativeGpa: number | null;
  courseCount: number;
  earned: number;
  total: number;
}

/**
 * The transcript hero — the one place in the app allowed a gradient, and
 * only the faintest orange → white wash behind the GPA.
 */
export function TranscriptHero({ cumulativeGpa, courseCount, earned, total }: TranscriptHeroProps) {
  const pct = total === 0 ? 0 : Math.min(100, Math.round((earned / total) * 100));
  const left = Math.max(0, total - earned);

  return (
    <View className="px-5 pt-4">
      <View
        className="overflow-hidden rounded-2xl border border-[#E5E7EB]"
        style={{
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowRadius: 3,
          shadowOffset: { width: 0, height: 1 },
          elevation: 1,
        }}
      >
        {/* Ultra-light orange → white wash (the app's only gradient). */}
        <Svg
          width="100%"
          height="100%"
          style={{ position: "absolute", top: 0, left: 0 }}
          pointerEvents="none"
        >
          <Defs>
            <LinearGradient id="transcriptHero" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#FFF1E7" stopOpacity="0.95" />
              <Stop offset="1" stopColor="#FFFFFF" stopOpacity="1" />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#transcriptHero)" />
        </Svg>

        <View className="p-5">
          <View className="flex-row items-center gap-2">
            <View className="rounded-full bg-white/70 px-3 py-1.5">
              <Text className="text-[11px]" style={{ color: "#B45309", fontWeight: "700" }}>
                Cumulative · {courseCount} courses
              </Text>
            </View>
            <View className="rounded-full bg-white/70 px-3 py-1.5">
              <Text className="text-[11px]" style={{ color: "#B45309", fontWeight: "700" }}>
                {gpaLabel(cumulativeGpa)}
              </Text>
            </View>
          </View>

          <View className="mt-5 flex-row items-end justify-between">
            <View>
              <Text className="text-[11px]" style={{ color: "#6B7280" }}>
                Cumulative GPA
              </Text>
              <View className="flex-row items-baseline gap-1">
                <Text
                  className="text-[64px] leading-[70px] tabular-nums"
                  style={{ color: "#1A1A1A", fontWeight: "700" }}
                >
                  {cumulativeGpa != null ? cumulativeGpa.toFixed(2) : "—"}
                </Text>
                <Text className="text-[15px]" style={{ color: "#6B7280" }}>
                  / 10
                </Text>
              </View>
            </View>
            <View className="items-end pb-2">
              <Text
                className="text-[22px] tabular-nums"
                style={{ color: "#1A1A1A", fontWeight: "700" }}
              >
                {earned}
                <Text className="text-[14px]" style={{ color: "#6B7280" }}>
                  /{total}
                </Text>
              </Text>
              <Text className="text-[11px]" style={{ color: "#6B7280" }}>
                credits earned
              </Text>
            </View>
          </View>

          <View className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
            <View
              className="h-full rounded-full"
              style={{ width: `${pct}%`, backgroundColor: "#F37021" }}
            />
          </View>
          <Text className="mt-2 text-[11px]" style={{ color: "#6B7280" }}>
            {pct}% completed · {left} credits left to graduate
          </Text>
        </View>
      </View>
    </View>
  );
}
