import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/ScreenHeader";
import { StatCard } from "@/components/StatCard";
import { useMyProfile } from "@/lib/queries/profile";
import { useAuthStore } from "@/stores/auth";

export default function HomeScreen() {
  const userId = useAuthStore((s) => s.session?.user.id ?? null);
  const { data, isLoading, isError } = useMyProfile(userId);

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900" edges={["top"]}>
      <ScreenHeader
        title={`Xin chào, ${data?.user.full_name ?? "bạn"} 👋`}
        subtitle="Chào mừng bạn đến với FAAPS Mobile"
      />
      <ScrollView className="flex-1 px-5 py-5" contentContainerStyle={{ paddingBottom: 40 }}>
        {isLoading ? (
          <View className="items-center justify-center py-12">
            <ActivityIndicator color="#F36F21" />
          </View>
        ) : isError || !data ? (
          <Text className="text-center text-red-500">
            Không tải được thông tin sinh viên.
          </Text>
        ) : (
          <>
            {/* KPI row */}
            <View className="flex-row gap-3 mb-5">
              <StatCard
                label="GPA"
                value={data.student.current_gpa.toFixed(2)}
                tone={data.student.current_gpa >= 5 ? "success" : "danger"}
                hint="/ 10.00"
              />
              <StatCard
                label="Tín chỉ"
                value={String(data.student.total_credits_earned)}
                hint={`/ ${data.major.total_credits}`}
              />
            </View>

            <View className="rounded-2xl bg-white dark:bg-slate-800 p-5 mb-5 border border-slate-100 dark:border-slate-700">
              <Text className="text-base font-semibold text-slate-900 dark:text-white mb-3">
                Thông tin học tập
              </Text>
              <Row label="Mã sinh viên" value={data.student.student_code} />
              <Row label="Chuyên ngành" value={data.major.name} />
              <Row label="Chương trình" value={data.curriculum_version.name} />
              <Row label="Học kỳ hiện tại" value={`Kỳ ${data.student.current_semester}`} />
              <Row
                label="Trạng thái"
                value={data.student.academic_status}
                last
              />
            </View>

            <View className="rounded-2xl bg-white dark:bg-slate-800 p-5 border border-slate-100 dark:border-slate-700">
              <Text className="text-base font-semibold text-slate-900 dark:text-white mb-3">
                Advisor của bạn
              </Text>
              {data.advisor ? (
                <View>
                  <Text className="text-base text-slate-900 dark:text-white">
                    {data.advisor.user.full_name}
                  </Text>
                  <Text className="text-sm text-slate-500 mt-1">
                    {data.advisor.user.email}
                  </Text>
                  <Text className="text-xs text-slate-400 mt-2">
                    Nhóm: {data.advisor.assignment.group_name ?? "—"}
                  </Text>
                </View>
              ) : (
                <Text className="text-sm text-slate-500">
                  Bạn chưa được phân công advisor. Liên hệ Phòng SV để được hỗ trợ.
                </Text>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View
      className={[
        "flex-row items-center justify-between py-2.5",
        last ? "" : "border-b border-slate-100 dark:border-slate-700",
      ].join(" ")}
    >
      <Text className="text-sm text-slate-500">{label}</Text>
      <Text className="text-sm font-semibold text-slate-900 dark:text-white">
        {value}
      </Text>
    </View>
  );
}
