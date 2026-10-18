import { View, Text } from "react-native";

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "success" | "warning" | "danger";
}

const toneClasses = {
  default: {
    bg: "bg-white dark:bg-slate-800",
    text: "text-slate-900 dark:text-white",
    accent: "bg-slate-100 dark:bg-slate-700",
  },
  success: {
    bg: "bg-green-50 dark:bg-green-900/20",
    text: "text-green-900 dark:text-green-200",
    accent: "bg-green-100 dark:bg-green-800/30",
  },
  warning: {
    bg: "bg-amber-50 dark:bg-amber-900/20",
    text: "text-amber-900 dark:text-amber-200",
    accent: "bg-amber-100 dark:bg-amber-800/30",
  },
  danger: {
    bg: "bg-red-50 dark:bg-red-900/20",
    text: "text-red-900 dark:text-red-200",
    accent: "bg-red-100 dark:bg-red-800/30",
  },
};

export function StatCard({ label, value, hint, tone = "default" }: StatCardProps) {
  const t = toneClasses[tone];
  return (
    <View className={["flex-1 rounded-2xl p-4 border border-slate-100 dark:border-slate-700", t.bg].join(" ")}>
      <Text className={["text-xs font-medium uppercase tracking-wide", t.text, "opacity-70"].join(" ")}>
        {label}
      </Text>
      <Text className={["mt-2 text-2xl font-bold", t.text].join(" ")}>
        {value}
      </Text>
      {hint ? (
        <View className={["mt-2 self-start rounded-md px-2 py-0.5", t.accent].join(" ")}>
          <Text className={["text-[11px] font-medium", t.text].join(" ")}>
            {hint}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
