import { useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";

import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyProfile } from "@/lib/queries/profile";
import { useNotifications } from "@/lib/queries/notifications";
import { useRecommendedCourses } from "@/lib/queries/course";
import { useAuthStore } from "@/stores/auth";

// ─── FPT orange soul, warm paper ground ──────────────────────────────────────
// Direction: editorial-greeting (app home) mapped onto the FPT brand.
// Ground #FAF7F4, ink #191512, one flat orange #F36F21 for data + 1 action.
// No gradients, no icon-in-tinted-circle KPIs, numbers tabular & right-sized.

const ORANGE = "#F36F21";
const ORANGE_DEEP = "#B5460D";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 11) return "Chào buổi sáng";
  if (h < 14) return "Chào buổi trưa";
  if (h < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
}

function firstName(full: string): string {
  const parts = full.trim().split(/\s+/);
  return parts[parts.length - 1] ?? full;
}

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function todayVi(): string {
  const d = new Date();
  const weekdays = [
    "Chủ nhật",
    "Thứ Hai",
    "Thứ Ba",
    "Thứ Tư",
    "Thứ Năm",
    "Thứ Sáu",
    "Thứ Bảy",
  ];
  return `${weekdays[d.getDay()]}, ${d.getDate()}/${
    d.getMonth() + 1
  }/${d.getFullYear()}`;
}

function gpaRank(gpa: number): { label: string; color: string; bg: string } {
  if (gpa >= 8)
    return { label: "Giỏi", color: "#047857", bg: "rgba(255,255,255,0.22)" };
  if (gpa >= 6.5)
    return { label: "Khá", color: "#FFFFFF", bg: "rgba(255,255,255,0.22)" };
  if (gpa >= 5)
    return {
      label: "Trung bình",
      color: "#FFFFFF",
      bg: "rgba(255,255,255,0.22)",
    };
  return { label: "Cần cố gắng", color: "#FFFFFF", bg: "rgba(0,0,0,0.22)" };
}

const KIND_DOT: Record<string, string> = {
  PLAN: ORANGE,
  ADVISOR: "#2563EB",
  GRADE: "#059669",
  SYSTEM: "#9CA3AF",
};

const KIND_LABEL: Record<string, string> = {
  PLAN: "Kế hoạch",
  ADVISOR: "Advisor",
  GRADE: "Điểm",
  SYSTEM: "Hệ thống",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "vừa xong";
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} ngày trước`;
  return new Date(iso).toLocaleDateString("vi-VN");
}

export default function HomeScreen() {
  const userId = useAuthStore((s) => s.session?.user.id ?? null);
  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
    refetch: refetchProfile,
  } = useMyProfile(userId);
  const { data: notifications = [], refetch: refetchNotifs } =
    useNotifications();
  const { data: recommended = [], refetch: refetchRec } =
    useRecommendedCourses();

  const refreshing = profileLoading;
  const onRefresh = () => {
    refetchProfile();
    refetchNotifs();
    refetchRec();
  };

  const stats = useMemo(() => {
    if (!profile) return null;
    const earned = profile.student.total_credits_earned;
    const total = profile.major.total_credits;
    const pct =
      total === 0 ? 0 : Math.min(100, Math.round((earned / total) * 100));
    const left = Math.max(0, total - earned);
    return { earned, total, pct, left };
  }, [profile]);

  return (
    <SafeAreaView
      className="flex-1 bg-ground dark:bg-ground-dark"
      edges={["top"]}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={ORANGE}
          />
        }
      >
        {profileLoading || !profile || !stats ? (
          <HomeSkeleton />
        ) : profileError ? (
          <View className="mx-5 mt-10 items-center rounded-3xl bg-surface p-8 dark:bg-surface-dark">
            <MaterialCommunityIcons
              name="cloud-off-outline"
              size={40}
              color="#CBD5E1"
            />
            <Text className="mt-3 text-center text-sm text-ink-muted dark:text-ink-muted-dark">
              Không tải được thông tin sinh viên. Kéo xuống để thử lại.
            </Text>
          </View>
        ) : (
          <>
            {/* ── 1. Top bar: identity + bell ─────────────────────────── */}
            <View className="flex-row items-center gap-3 px-5 pt-4">
              <View
                className="h-12 w-12 items-center justify-center rounded-full"
                style={{ backgroundColor: ORANGE }}
              >
                <Text className="text-base font-bold text-white">
                  {initials(profile.user.full_name)}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-xs text-ink-faint dark:text-ink-faint-dark">
                  {todayVi()}
                </Text>
                <Text
                  accessibilityRole="header"
                  className="text-[17px] font-bold text-ink dark:text-ink-dark"
                  numberOfLines={1}
                >
                  {getGreeting()}, {firstName(profile.user.full_name)}
                </Text>
              </View>
              <NotifBell
                unread={notifications.filter((n) => !n.read_at).length}
              />
            </View>

            {/* ── 2. Hero: the semester at a glance (FPT orange field) ── */}
            <View className="px-5 pt-4">
              <View
                className="overflow-hidden rounded-[28px] p-5"
                style={{ backgroundColor: ORANGE }}
              >
                {/* decorative rings — flat white at low opacity, no gradient */}
                <View
                  pointerEvents="none"
                  className="absolute -right-16 -top-20 h-52 w-52 rounded-full"
                  style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
                />
                <View
                  pointerEvents="none"
                  className="absolute -bottom-24 -left-10 h-56 w-56 rounded-full"
                  style={{ backgroundColor: "rgba(0,0,0,0.08)" }}
                />
                <View
                  pointerEvents="none"
                  className="absolute right-10 top-24 h-16 w-16 rounded-full border-2"
                  style={{ borderColor: "rgba(255,255,255,0.35)" }}
                />

                <View className="flex-row items-center gap-2">
                  <View
                    className="rounded-full px-3 py-1.5"
                    style={{ backgroundColor: "rgba(255,255,255,0.22)" }}
                  >
                    <Text className="text-[11px] font-bold text-white">
                      Kỳ {profile.student.current_semester} ·{" "}
                      {profile.curriculum_version.version}
                    </Text>
                  </View>
                  <View
                    className="rounded-full px-3 py-1.5"
                    style={{
                      backgroundColor: gpaRank(profile.student.current_gpa)
                        .bg,
                    }}
                  >
                    <Text className="text-[11px] font-bold text-white">
                      {gpaRank(profile.student.current_gpa).label}
                    </Text>
                  </View>
                </View>

                <View className="mt-4 flex-row items-end justify-between">
                  <View>
                    <Text
                      className="text-xs font-medium"
                      style={{ color: "rgba(255,255,255,0.85)" }}
                    >
                      GPA tích lũy
                    </Text>
                    <View className="flex-row items-baseline gap-1">
                      <Text className="text-[52px] font-bold leading-[56px] text-white tabular-nums">
                        {profile.student.current_gpa.toFixed(2)}
                      </Text>
                      <Text
                        className="text-base font-medium"
                        style={{ color: "rgba(255,255,255,0.8)" }}
                      >
                        / 10
                      </Text>
                    </View>
                  </View>
                  <View className="items-end pb-1">
                    <Text
                      className="text-2xl font-bold text-white tabular-nums"
                    >
                      {stats.earned}
                      <Text
                        className="text-sm font-medium"
                        style={{ color: "rgba(255,255,255,0.8)" }}
                      >
                        /{stats.total}
                      </Text>
                    </Text>
                    <Text
                      className="text-[11px] font-medium"
                      style={{ color: "rgba(255,255,255,0.85)" }}
                    >
                      tín chỉ đã tích lũy
                    </Text>
                  </View>
                </View>

                {/* credit track */}
                <View
                  className="mt-3 h-2.5 w-full overflow-hidden rounded-full"
                  style={{ backgroundColor: "rgba(255,255,255,0.3)" }}
                >
                  <View
                    className="h-full rounded-full bg-white"
                    style={{ width: `${stats.pct}%` }}
                  />
                </View>
                <View className="mt-2 flex-row items-center justify-between">
                  <Text
                    className="text-[11px] font-medium"
                    style={{ color: "rgba(255,255,255,0.9)" }}
                  >
                    Hoàn thành {stats.pct}% · còn {stats.left} tín chỉ
                  </Text>
                  <Text
                    className="text-[11px] font-medium"
                    style={{ color: "rgba(255,255,255,0.9)" }}
                  >
                    {profile.student.student_code}
                  </Text>
                </View>

                <Pressable
                  onPress={() => router.push("/(app)/curriculum")}
                  accessibilityRole="button"
                  className="mt-4 flex-row items-center justify-center gap-2 rounded-2xl bg-white py-3.5 active:opacity-90"
                >
                  <MaterialCommunityIcons
                    name="book-open-page-variant"
                    size={17}
                    color={ORANGE_DEEP}
                  />
                  <Text
                    className="text-sm font-bold"
                    style={{ color: ORANGE_DEEP }}
                  >
                    Xem chương trình khung
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* ── 3. KPI strip: one card, hairline dividers (no icon tiles) ─ */}
            <View className="px-5 pt-4">
              <View className="flex-row rounded-3xl border border-line bg-surface dark:border-line-dark dark:bg-surface-dark">
                <View className="flex-1 items-center py-4">
                  <Text className="text-[11px] font-medium text-ink-muted dark:text-ink-muted-dark">
                    Học kỳ
                  </Text>
                  <Text className="mt-1 text-xl font-bold text-ink tabular-nums dark:text-ink-dark">
                    {profile.student.current_semester}/8
                  </Text>
                </View>
                <View className="w-px bg-line dark:bg-line-dark" />
                <View className="flex-1 items-center py-4">
                  <Text className="text-[11px] font-medium text-ink-muted dark:text-ink-muted-dark">
                    Chuyên ngành
                  </Text>
                  <Text
                    className="mt-1 text-[13px] font-bold text-ink dark:text-ink-dark"
                    numberOfLines={1}
                  >
                    {profile.major.code} · {profile.major.name.split(" ")[0]}
                  </Text>
                </View>
                <View className="w-px bg-line dark:bg-line-dark" />
                <View className="flex-1 items-center py-4">
                  <Text className="text-[11px] font-medium text-ink-muted dark:text-ink-muted-dark">
                    Trạng thái
                  </Text>
                  <View className="mt-1.5 flex-row items-center gap-1.5">
                    <View
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: "#059669" }}
                    />
                    <Text className="text-[13px] font-bold text-ink dark:text-ink-dark">
                      Đang học
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* ── 4. Specialization nudge (only when unset) ───────────── */}
            {!profile.specialization && (
              <View className="px-5 pt-4">
                <View className="flex-row items-center gap-3 rounded-3xl border border-line bg-brand-tint p-4 dark:border-line-dark dark:bg-brand-tint-dark">
                  <View
                    className="h-11 w-11 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: ORANGE }}
                  >
                    <MaterialCommunityIcons
                      name="compass-outline"
                      size={22}
                      color="#fff"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-ink dark:text-ink-dark">
                      Chọn chuyên ngành hẹp
                    </Text>
                    <Text className="mt-0.5 text-xs leading-4 text-ink-muted dark:text-ink-muted-dark">
                      AI, Cloud, Data… để advisor & gợi ý môn chuẩn hơn.
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => router.push("/(app)/profile")}
                    hitSlop={10}
                    className="rounded-full px-3.5 py-2.5 active:opacity-80"
                    style={{ backgroundColor: ORANGE }}
                  >
                    <Text className="text-xs font-bold text-white">Chọn</Text>
                  </Pressable>
                </View>
              </View>
            )}

            {/* ── 5. Quick access — 2 × 2, flat cards, one orange ─────── */}
            <View className="px-5 pt-6">
              <SectionTitle
                title="Truy cập nhanh"
                action="Tất cả"
                onPress={() => router.push("/(app)/courses")}
              />
              <View className="mt-3 flex-row gap-3">
                <QuickCard
                  icon="magnify"
                  title="Tra cứu môn"
                  desc="Mã, tên, tiên quyết"
                  onPress={() => router.push("/(app)/courses")}
                  featured
                />
                <QuickCard
                  icon="school-outline"
                  title="Lộ trình 8 kỳ"
                  desc={`${stats.pct}% đã xong`}
                  onPress={() => router.push("/(app)/curriculum")}
                />
              </View>
              <View className="mt-3 flex-row gap-3">
                <QuickCard
                  icon="account-outline"
                  title="Hồ sơ & CN"
                  desc={profile.specialization?.name ?? "Chưa chọn CN"}
                  onPress={() => router.push("/(app)/profile")}
                />
                <QuickCard
                  icon="email-outline"
                  title="Advisor"
                  desc={profile.advisor ? "Đang kết nối" : "Chưa phân công"}
                  onPress={() => router.push("/(app)/profile")}
                />
              </View>
            </View>

            {/* ── 6. Advisor — the human behind the plan ──────────────── */}
            <View className="px-5 pt-6">
              <SectionTitle title="Advisor của bạn" />
              <View className="mt-3 rounded-3xl border border-line bg-surface p-4 dark:border-line-dark dark:bg-surface-dark">
                {profile.advisor ? (
                  <View className="flex-row items-center gap-3">
                    <View
                      className="items-center justify-center rounded-full"
                      style={{
                        width: 52,
                        height: 52,
                        backgroundColor: "#FFE5D4",
                      }}
                    >
                      <Text
                        className="text-lg font-bold"
                        style={{ color: ORANGE_DEEP }}
                      >
                        {initials(profile.advisor.user.full_name)}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-[15px] font-bold text-ink dark:text-ink-dark">
                        {profile.advisor.user.full_name}
                      </Text>
                      <Text
                        className="mt-0.5 text-xs text-ink-muted dark:text-ink-muted-dark"
                        numberOfLines={1}
                      >
                        {profile.advisor.user.email}
                      </Text>
                      <View className="mt-1.5 self-start rounded-full bg-raised px-2.5 py-1 dark:bg-raised-dark">
                        <Text className="text-[11px] font-semibold text-ink-muted dark:text-ink-muted-dark">
                          Nhóm {profile.advisor.assignment.group_name ?? "—"}
                        </Text>
                      </View>
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      className="h-11 w-11 items-center justify-center rounded-full active:opacity-80"
                      style={{ backgroundColor: ORANGE }}
                    >
                      <MaterialCommunityIcons
                        name="chat-outline"
                        size={20}
                        color="#fff"
                      />
                    </Pressable>
                  </View>
                ) : (
                  <Text className="text-sm text-ink-muted dark:text-ink-muted-dark">
                    Bạn chưa được phân công advisor. Liên hệ Phòng Đào tạo để
                    được hỗ trợ.
                  </Text>
                )}
              </View>
            </View>

            {/* ── 7. Reminders — latest notifications ─────────────────── */}
            {notifications.length > 0 && (
              <View className="px-5 pt-6">
                <SectionTitle
                  title="Nhắc việc"
                  action={`${
                    notifications.filter((n) => !n.read_at).length
                  } mới`}
                />
                <View className="mt-3 overflow-hidden rounded-3xl border border-line bg-surface dark:border-line-dark dark:bg-surface-dark">
                  {notifications.slice(0, 3).map((n, i) => (
                    <View key={n.id}>
                      <View className="flex-row items-start gap-3 p-4">
                        <View
                          className="mt-1.5 h-2.5 w-2.5 rounded-full"
                          style={{
                            backgroundColor: KIND_DOT[n.kind] ?? "#9CA3AF",
                          }}
                        />
                        <View className="flex-1">
                          <View className="flex-row items-center justify-between gap-2">
                            <Text className="flex-1 text-sm font-bold text-ink dark:text-ink-dark">
                              {n.title}
                            </Text>
                            {!n.read_at && (
                              <View
                                className="rounded-full px-2 py-0.5"
                                style={{ backgroundColor: "#FFF1E7" }}
                              >
                                <Text
                                  className="text-[10px] font-bold"
                                  style={{ color: ORANGE_DEEP }}
                                >
                                  MỚI
                                </Text>
                              </View>
                            )}
                          </View>
                          <Text
                            className="mt-1 text-[13px] leading-5 text-ink-muted dark:text-ink-muted-dark"
                            numberOfLines={2}
                          >
                            {n.body}
                          </Text>
                          <Text className="mt-1.5 text-[11px] text-ink-faint dark:text-ink-faint-dark">
                            {KIND_LABEL[n.kind] ?? n.kind} ·{" "}
                            {timeAgo(n.created_at)}
                          </Text>
                        </View>
                      </View>
                      {i < Math.min(2, notifications.length - 1) && (
                        <View className="ml-[30px] h-px bg-rule dark:bg-rule-dark" />
                      )}
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* ── 8. Suggested next courses ──────────────────────────── */}
            {recommended.length > 0 && (
              <View className="pt-6">
                <View className="px-5">
                  <SectionTitle
                    title="Gợi ý kỳ tới"
                    action="Tra cứu"
                    onPress={() => router.push("/(app)/courses")}
                  />
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingTop: 12,
                    gap: 12,
                  }}
                >
                  {recommended.slice(0, 6).map((c) => (
                    <Pressable
                      key={c.id}
                      onPress={() => router.push("/(app)/courses")}
                      className="w-[200px] rounded-3xl border border-line bg-surface p-4 active:opacity-90 dark:border-line-dark dark:bg-surface-dark"
                    >
                      <View className="flex-row items-center justify-between">
                        <Text
                          className="text-[11px] font-bold tracking-wide"
                          style={{ color: ORANGE_DEEP }}
                        >
                          {c.code}
                        </Text>
                        <View className="rounded-full bg-raised px-2 py-0.5 dark:bg-raised-dark">
                          <Text className="text-[10px] font-bold text-ink-muted dark:text-ink-muted-dark">
                            {c.credits} TC
                          </Text>
                        </View>
                      </View>
                      <Text
                        className="mt-2 min-h-[40px] text-sm font-bold leading-5 text-ink dark:text-ink-dark"
                        numberOfLines={2}
                      >
                        {c.name}
                      </Text>
                      <View className="mt-3 flex-row items-center gap-1">
                        <MaterialCommunityIcons
                          name="arrow-right"
                          size={14}
                          color={ORANGE}
                        />
                        <Text
                          className="text-xs font-semibold"
                          style={{ color: ORANGE }}
                        >
                          Xem chi tiết
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* ── 9. Study meta ──────────────────────────────────────── */}
            <View className="mx-5 mt-6 rounded-3xl bg-raised p-4 dark:bg-raised-dark">
              <View className="flex-row items-center justify-between">
                <Text className="text-xs font-semibold text-ink-muted dark:text-ink-muted-dark">
                  {profile.major.name}
                </Text>
                <Text className="text-xs text-ink-faint dark:text-ink-faint-dark">
                  {profile.curriculum_version.name}
                </Text>
              </View>
              <View className="mt-3">
                <Progress value={stats.pct} color="primary" />
              </View>
              <Text className="mt-2 text-center text-[11px] text-ink-faint dark:text-ink-faint-dark">
                FAAPS · FPT University HCMC — đồng hành cùng bạn tới tốt
                nghiệp
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Pieces ────────────────────────────────────────────────────────────────

function NotifBell({ unread }: { unread: number }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Thông báo"
      className="relative h-11 w-11 items-center justify-center rounded-full border border-line bg-surface active:opacity-80 dark:border-line-dark dark:bg-surface-dark"
    >
      <MaterialCommunityIcons name="bell-outline" size={20} color="#191512" />
      {unread > 0 && (
        <View
          className="absolute -right-0.5 -top-0.5 min-h-[20px] min-w-[20px] items-center justify-center rounded-full border-2 border-white px-1"
          style={{ backgroundColor: ORANGE }}
        >
          <Text className="text-[10px] font-bold text-white tabular-nums">
            {unread > 9 ? "9+" : unread}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

function SectionTitle({
  title,
  action,
  onPress,
}: {
  title: string;
  action?: string;
  onPress?: () => void;
}) {
  return (
    <View className="flex-row items-end justify-between">
      <Text className="text-[15px] font-bold text-ink dark:text-ink-dark">
        {title}
      </Text>
      {action ? (
        <Pressable onPress={onPress} hitSlop={10}>
          <Text className="text-xs font-bold" style={{ color: ORANGE }}>
            {action}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function QuickCard({
  icon,
  title,
  desc,
  onPress,
  featured,
}: {
  icon: string;
  title: string;
  desc: string;
  onPress: () => void;
  featured?: boolean;
}) {
  // The featured card wears the brand's deep orange — never a black slab.
  // It reads as the primary action against its white neighbour while
  // staying inside the page's orange / white / warm-paper family.
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const featuredBg = isDark ? "#C25510" : "#D85A11";
  const featuredBorder = isDark ? "#C25510" : "#D85A11";

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="flex-1 rounded-3xl border p-4 active:opacity-90"
      style={
        featured
          ? {
              backgroundColor: featuredBg,
              borderColor: featuredBorder,
            }
          : {
              backgroundColor: "#FFFFFF",
              borderColor: "#EAE1D8",
            }
      }
    >
      <MaterialCommunityIcons
        name={icon as any}
        size={22}
        color={featured ? "#FFFFFF" : ORANGE}
      />
      <Text
        className="mt-3 text-sm font-bold"
        style={{ color: featured ? "#FFFFFF" : "#191512" }}
      >
        {title}
      </Text>
      <Text
        className="mt-0.5 text-[11px]"
        style={{ color: featured ? "rgba(255,255,255,0.82)" : "#6A6058" }}
        numberOfLines={1}
      >
        {desc}
      </Text>
      <View className="mt-3 flex-row items-center gap-1">
        <Text
          className="text-[11px] font-bold"
          style={{ color: featured ? "#FFFFFF" : ORANGE }}
        >
          Mở
        </Text>
        <MaterialCommunityIcons
          name="chevron-right"
          size={14}
          color={featured ? "#FFFFFF" : ORANGE}
        />
      </View>
    </Pressable>
  );
}

function HomeSkeleton() {
  return (
    <View className="px-5 pt-4">
      <View className="flex-row items-center gap-3">
        <Skeleton width={48} height={48} className="rounded-full" />
        <View className="flex-1 gap-2">
          <Skeleton width="40%" height={12} />
          <Skeleton width="70%" height={18} />
        </View>
        <Skeleton width={44} height={44} className="rounded-full" />
      </View>
      <Skeleton height={280} className="mt-4 rounded-[28px]" />
      <View className="mt-4 flex-row gap-3">
        <Skeleton height={86} className="flex-1 rounded-3xl" />
        <Skeleton height={86} className="flex-1 rounded-3xl" />
      </View>
      <Skeleton width="45%" height={18} className="mt-6" />
      <View className="mt-3 flex-row gap-3">
        <Skeleton height={130} className="flex-1 rounded-3xl" />
        <Skeleton height={130} className="flex-1 rounded-3xl" />
      </View>
      <View className="mt-6 items-center">
        <ActivityIndicator color={ORANGE} />
      </View>
    </View>
  );
}
