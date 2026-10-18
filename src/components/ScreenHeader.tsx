import { View, Text } from "react-native";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}

export function ScreenHeader({ title, subtitle, right }: ScreenHeaderProps) {
  return (
    <View className="px-5 pt-6 pb-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-2xl font-bold text-slate-900 dark:text-white">
            {title}
          </Text>
          {subtitle ? (
            <Text className="mt-1 text-sm text-slate-500">{subtitle}</Text>
          ) : null}
        </View>
        {right}
      </View>
    </View>
  );
}
