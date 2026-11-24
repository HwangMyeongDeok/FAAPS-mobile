import { Text, View, Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Progress } from "@/components/ui/progress";
import { cardShadow } from "@/lib/shadow";
import type { AcademicProgress, AppNotification, NotificationPage, StudentAdvisor, StudentProfile } from "@/types";
import type { Course } from "@/types/course";
import { ORANGE, NOTIFICATION_DOT, NOTIFICATION_LABEL, initials, timeAgo } from "../format";
import { SectionTitle } from "./common";

/** AI entry card — two actions. */
export function AiEntryCard() {
  return (
    <View className="px-5 pt-5">
      <View className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white" style={cardShadow(false)}>
        <View className="flex-row items-center gap-3 px-4 py-3.5">
          <View className="h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: ORANGE }}>
            <MaterialCommunityIcons name="creation" size={20} color="#fff" />
          </View>
          <View className="flex-1">
            <Text className="text-[14px] text-ink" style={{ fontWeight: "700" }}>
              Trợ lý học vụ AI
            </Text>
            <Text className="mt-0.5 text-[11px] leading-4 text-ink-muted">
              Trả lời dựa trên chương trình đào tạo · có trích dẫn
            </Text>
          </View>
        </View>
        <View className="flex-row border-t border-rule">
          <Pressable
            onPress={() => router.push("/(app)/ai-chat")}
            accessibilityRole="button"
            accessibilityLabel="Hỏi trợ lý AI"
            className="flex-1 flex-row items-center justify-center gap-2 py-3.5 active:opacity-70"
          >
            <MaterialCommunityIcons name="message-text-outline" size={17} color={ORANGE} />
            <Text className="text-[13px] font-bold" style={{ color: ORANGE }}>
              Hỏi AI
            </Text>
          </Pressable>
          <View className="w-px bg-rule" />
          <Pressable
            onPress={() => router.push("/(app)/ai-roadmap")}
            accessibilityRole="button"
            accessibilityLabel="Xem lộ trình AI"
            className="flex-1 flex-row items-center justify-center gap-2 py-3.5 active:opacity-70"
          >
            <MaterialCommunityIcons name="map-marker-path" size={17} color={ORANGE} />
            <Text className="text-[13px] font-bold" style={{ color: ORANGE }}>
              Lộ trình AI
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

/** Advisor section with retry. */
export function AdvisorSection({ advisor, advisorError, isDark, onRetry }: { advisor?: StudentAdvisor | null; advisorError: boolean; isDark: boolean; onRetry: () => void }) {
  return (
    <View className="px-5 pt-5">
      <SectionTitle title="Cố vấn của bạn" />
      <View className="mt-3 rounded-2xl border border-[#E5E7EB] bg-white p-4" style={cardShadow(false)}>
        {advisorError ? (
          <View className="flex-row items-center gap-3">
            <MaterialCommunityIcons name="cloud-off-outline" size={24} color="#9CA3AF" />
            <View className="flex-1">
              <Text className="text-[13px] text-ink" style={{ fontWeight: "600" }}>
                Không tải được thông tin cố vấn
              </Text>
              <Text className="mt-0.5 text-[11px] text-ink-muted">
                Kiểm tra kết nối và thử lại.
              </Text>
            </View>
            <Pressable onPress={onRetry} hitSlop={8} className="rounded-full bg-[#F3F4F6] px-3 py-1.5 active:opacity-70">
              <Text className="text-[11px] text-brand-ink" style={{ fontWeight: "700" }}>
                Thử lại
              </Text>
            </Pressable>
          </View>
        ) : advisor ? (
          <View className="flex-row items-center gap-3">
            <View className="items-center justify-center rounded-full" style={{ width: 52, height: 52, backgroundColor: "#FFF1E7" }}>
              <Text className="text-lg" style={{ color: "#B45309", fontWeight: "700" }}>
                {initials(advisor.fullName)}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-[15px] text-ink" style={{ fontWeight: "700" }}>
                {advisor.fullName}
              </Text>
              <Text className="mt-0.5 text-[11px] text-ink-muted" numberOfLines={1}>
                {advisor.email}
              </Text>
              <View className="mt-1.5 self-start rounded-full bg-[#F3F4F6] px-2.5 py-1">
                <Text className="text-[10px] text-ink-muted" style={{ fontWeight: "600" }}>
                  {advisor.specialization ?? advisor.groupName ?? "Cố vấn"}
                </Text>
              </View>
            </View>
            <Pressable
              onPress={() => router.push("/(app)/advising")}
              accessibilityRole="button"
              accessibilityLabel={`Nhắn tin cho ${advisor.fullName}`}
              className="h-11 w-11 items-center justify-center rounded-full active:opacity-70"
              style={{ backgroundColor: ORANGE }}
            >
              <MaterialCommunityIcons name="chat-outline" size={20} color="#fff" />
            </Pressable>
          </View>
        ) : (
          <Text className="text-[13px] text-ink-muted">
            Bạn chưa được phân công cố vấn học tập. Liên hệ văn phòng học vụ để được hỗ trợ.
          </Text>
        )}
      </View>
    </View>
  );
}

/** Latest reminders. */
export function RemindersSection({ notifications, unreadCount }: { notifications?: NotificationPage; unreadCount: number }) {
  if (!notifications || notifications.items.length === 0) return null;
  return (
    <View className="px-5 pt-5">
      <SectionTitle title="Nhắc nhở" action={`${unreadCount} mới`} onPress={() => router.push("/(app)/(tabs)/notifications")} />
      <View className="mt-3 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
        {notifications.items.slice(0, 3).map((n: AppNotification, i: number) => (
          <View key={n.id}>
            <View className="flex-row items-start gap-3 p-4">
              <View className="mt-1.5 h-2.5 w-2.5 rounded-full" style={{ backgroundColor: NOTIFICATION_DOT[n.notificationType] ?? "#9CA3AF" }} />
              <View className="flex-1">
                <View className="flex-row items-center justify-between gap-2">
                  <Text className="flex-1 text-[13px] text-ink" style={{ fontWeight: "700" }}>
                    {n.title}
                  </Text>
                  {!n.isRead ? (
                    <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: "#FFF1E7" }}>
                      <Text className="text-[10px] text-brand-ink" style={{ fontWeight: "700" }}>
                        MỚI
                      </Text>
                    </View>
                  ) : null}
                </View>
                <Text className="mt-1 text-[12px] leading-5 text-ink-muted" numberOfLines={2}>
                  {n.message}
                </Text>
                <Text className="mt-1.5 text-[11px] text-ink-faint">
                  {NOTIFICATION_LABEL[n.notificationType] ?? n.notificationType} · {timeAgo(n.createdAt)}
                </Text>
              </View>
            </View>
            {i < Math.min(2, notifications.items.length - 1) ? <View className="ml-[30px] h-px bg-rule" /> : null}
          </View>
        ))}
      </View>
    </View>
  );
}

/** Horizontal course preview. */
export function CatalogPreview({ courses }: { courses: Course[] }) {
  if (!courses || courses.length === 0) return null;
  return (
    <View className="pt-5">
      <View className="px-5">
        <SectionTitle title="Danh mục môn học" action="Xem tất cả" onPress={() => router.push("/(app)/(tabs)/courses")} />
      </View>
      <View className="mt-3 flex-row gap-3 px-5">
        {courses.slice(0, 6).map((c) => (
          <Pressable
            key={c.id}
            onPress={() => router.push("/(app)/(tabs)/courses")}
            className="w-[200px] rounded-2xl border border-[#E5E7EB] bg-white p-4 active:opacity-90"
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-[11px]" style={{ color: "#B45309", fontWeight: "700" }}>
                {c.code}
              </Text>
              <View className="rounded-full bg-[#F3F4F6] px-2 py-0.5">
                <Text className="text-[10px] text-ink-muted" style={{ fontWeight: "700" }}>
                  {c.credits} tc
                </Text>
              </View>
            </View>
            <Text className="mt-2 min-h-[40px] text-[13px] leading-5 text-ink" style={{ fontWeight: "700" }} numberOfLines={2}>
              {c.name}
            </Text>
            <View className="mt-3 flex-row items-center gap-1">
              <MaterialCommunityIcons name="arrow-right" size={14} color={ORANGE} />
              <Text className="text-[11px]" style={{ color: ORANGE, fontWeight: "700" }}>
                Xem chi tiết
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

/** Footer meta strip. */
export function StudyMetaFooter({ profile, stats }: { profile: StudentProfile; progress?: AcademicProgress | null; stats: { pct: number } }) {
  return (
    <View className="mx-5 mt-6 rounded-2xl bg-[#F3F4F6] p-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-[11px] text-ink-muted" style={{ fontWeight: "600" }}>
          {profile.majorName ?? "FAAPS"}
        </Text>
        <Text className="text-[11px] text-ink-faint">{profile.cohort ?? ""}</Text>
      </View>
      <View className="mt-3">
        <Progress value={stats.pct} color="primary" />
      </View>
      <Text className="mt-2 text-center text-[10px] text-ink-faint">
        FAAPS · FPT University HCMC — đồng hành cùng bạn đến ngày tốt nghiệp
      </Text>
    </View>
  );
}
