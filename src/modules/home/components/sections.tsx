import { Text, View, Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Progress } from "@/components/ui/progress";
import { cardShadow } from "@/lib/shadow";
import type { AcademicProgress, AppNotification, NotificationPage, StudentAdvisor, StudentProfile } from "@/types";
import type { Course } from "@/types/course";
import { ORANGE, ORANGE_DEEP, NOTIFICATION_DOT, NOTIFICATION_LABEL, firstName, getGreeting, gpaRank, initials, timeAgo, today } from "../format";
import { NavRow, NotifBell, QuickCard, SectionTitle } from "./common";

/** Top bar: identity + bell. */
export function HomeTopBar({ profile, unreadCount, onNotif }: { profile: StudentProfile; unreadCount: number; onNotif: () => void }) {
  return (
    <View className="flex-row items-center gap-3 px-5 pt-4">
      <View className="h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: ORANGE }}>
        <Text className="text-base font-bold text-white">{initials(profile.fullName)}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-xs text-ink-faint dark:text-ink-faint-dark">{today()}</Text>
        <Text accessibilityRole="header" className="text-[17px] font-bold text-ink dark:text-ink-dark" numberOfLines={1}>
          {getGreeting()}, {firstName(profile.fullName)}
        </Text>
      </View>
      <NotifBell unread={unreadCount} onPress={onNotif} />
    </View>
  );
}

/** Orange hero: GPA + credit progress. */
export function HomeHero({ profile, gpa, stats }: { profile: StudentProfile; gpa: number | null; stats: { earned: number; total: number; pct: number; left: number } }) {
  return (
    <View className="px-5 pt-4">
      <View className="overflow-hidden rounded-[28px] p-5" style={{ backgroundColor: ORANGE }}>
        <View pointerEvents="none" className="absolute -right-16 -top-20 h-52 w-52 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.12)" }} />
        <View pointerEvents="none" className="absolute -bottom-24 -left-10 h-56 w-56 rounded-full" style={{ backgroundColor: "rgba(0,0,0,0.08)" }} />
        <View pointerEvents="none" className="absolute right-10 top-24 h-16 w-16 rounded-full border-2" style={{ borderColor: "rgba(255,255,255,0.35)" }} />
        <View className="flex-row items-center gap-2">
          <View className="rounded-full px-3 py-1.5" style={{ backgroundColor: "rgba(255,255,255,0.22)" }}>
            <Text className="text-[11px] font-bold text-white">Semester {profile.currentSemester ?? "—"} · {profile.cohort ?? "—"}</Text>
          </View>
          <View className="rounded-full px-3 py-1.5" style={{ backgroundColor: gpaRank(gpa).bg }}>
            <Text className="text-[11px] font-bold text-white">{gpaRank(gpa).label}</Text>
          </View>
        </View>
        <View className="mt-4 flex-row items-end justify-between">
          <View>
            <Text className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.85)" }}>Cumulative GPA</Text>
            <View className="flex-row items-baseline gap-1">
              <Text className="text-[52px] font-bold leading-[56px] text-white tabular-nums">{gpa != null ? gpa.toFixed(2) : "—"}</Text>
              <Text className="text-base font-medium" style={{ color: "rgba(255,255,255,0.8)" }}>/ 10</Text>
            </View>
          </View>
          <View className="items-end pb-1">
            <Text className="text-2xl font-bold text-white tabular-nums">{stats.earned}<Text className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.8)" }}>/{stats.total}</Text></Text>
            <Text className="text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.85)" }}>credits earned</Text>
          </View>
        </View>
        <View className="mt-3 h-2.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.3)" }}>
          <View className="h-full rounded-full bg-white" style={{ width: `${stats.pct}%` }} />
        </View>
        <View className="mt-2 flex-row items-center justify-between">
          <Text className="text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.9)" }}>{stats.pct}% completed · {stats.left} credits left</Text>
          <Text className="text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.9)" }}>{profile.studentCode ?? "—"}</Text>
        </View>
        <Pressable onPress={() => router.push("/(app)/(tabs)/curriculum")} accessibilityRole="button" accessibilityLabel="View the curriculum" className="mt-4 flex-row items-center justify-center gap-2 rounded-2xl bg-white py-3.5 active:opacity-90 active:scale-[0.99]">
          <MaterialCommunityIcons name="book-open-page-variant" size={17} color={ORANGE_DEEP} />
          <Text className="text-sm font-bold" style={{ color: ORANGE_DEEP }}>View curriculum</Text>
        </Pressable>
      </View>
    </View>
  );
}

/** AI entry card — two actions. */
export function AiEntryCard() {
  return (
    <View className="px-5 pt-4">
      <View className="overflow-hidden rounded-[28px] border border-line bg-surface dark:border-line-dark dark:bg-surface-dark">
        <View className="flex-row items-center gap-3 px-4 py-3.5">
          <View className="h-10 w-10 items-center justify-center rounded-2xl" style={{ backgroundColor: ORANGE }}>
            <MaterialCommunityIcons name="creation" size={20} color="#fff" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-bold text-ink dark:text-ink-dark">AI Academic Assistant</Text>
            <Text className="mt-0.5 text-[11px] leading-4 text-ink-muted dark:text-ink-muted-dark">Answers grounded in your curriculum · with citations</Text>
          </View>
        </View>
        <View className="flex-row border-t border-rule dark:border-rule-dark">
          <Pressable onPress={() => router.push("/(app)/ai-chat")} accessibilityRole="button" accessibilityLabel="Ask the AI academic assistant" className="flex-1 flex-row items-center justify-center gap-2 py-3.5 active:opacity-70">
            <MaterialCommunityIcons name="message-text-outline" size={17} color={ORANGE} />
            <Text className="text-[13px] font-bold" style={{ color: ORANGE }}>Ask AI</Text>
          </Pressable>
          <View className="w-px bg-rule dark:bg-rule-dark" />
          <Pressable onPress={() => router.push("/(app)/ai-roadmap")} accessibilityRole="button" accessibilityLabel="View the AI study roadmap" className="flex-1 flex-row items-center justify-center gap-2 py-3.5 active:opacity-70">
            <MaterialCommunityIcons name="map-marker-path" size={17} color={ORANGE} />
            <Text className="text-[13px] font-bold" style={{ color: ORANGE }}>AI Roadmap</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

/** KPI strip: semester / major / status. */
export function KpiStrip({ profile }: { profile: StudentProfile }) {
  return (
    <View className="px-5 pt-4">
      <View className="flex-row rounded-3xl border border-line bg-surface dark:border-line-dark dark:bg-surface-dark">
        <View className="flex-1 items-center py-4">
          <Text className="text-[11px] font-medium text-ink-muted dark:text-ink-muted-dark">Semester</Text>
          <Text className="mt-1 text-xl font-bold text-ink tabular-nums dark:text-ink-dark">{profile.currentSemester ?? "—"}</Text>
        </View>
        <View className="w-px bg-line dark:bg-line-dark" />
        <View className="flex-1 items-center py-4">
          <Text className="text-[11px] font-medium text-ink-muted dark:text-ink-muted-dark">Major</Text>
          <Text className="mt-1 text-[13px] font-bold text-ink dark:text-ink-dark" numberOfLines={1}>{profile.majorCode ?? "—"}</Text>
        </View>
        <View className="w-px bg-line dark:bg-line-dark" />
        <View className="flex-1 items-center py-4">
          <Text className="text-[11px] font-medium text-ink-muted dark:text-ink-muted-dark">Status</Text>
          <View className="mt-1.5 flex-row items-center gap-1.5">
            <View className="h-2 w-2 rounded-full" style={{ backgroundColor: "#059669" }} />
            <Text className="text-[13px] font-bold text-ink dark:text-ink-dark">{profile.academicStatus ?? "ACTIVE"}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

/** Quick access grid + study plan / transcript rows. */
export function QuickAccess({ stats, advisor, profile, gpa, isDark }: { stats: { pct: number; earned: number; total: number }; advisor?: StudentAdvisor | null; profile: StudentProfile; gpa: number | null; isDark: boolean }) {
  return (
    <View className="px-5 pt-6">
      <SectionTitle title="Quick access" action="All" onPress={() => router.push("/(app)/(tabs)/courses")} />
      <View className="mt-3 flex-row gap-3">
        <QuickCard icon="magnify" title="Course catalog" desc="Code, name, prerequisites" onPress={() => router.push("/(app)/(tabs)/courses")} featured />
        <QuickCard icon="school-outline" title="Curriculum" desc={`${stats.pct}% completed`} onPress={() => router.push("/(app)/(tabs)/curriculum")} />
      </View>
      <View className="mt-3 flex-row gap-3">
        <QuickCard icon="account-outline" title="Profile" desc={profile.majorName ?? "Student profile"} onPress={() => router.push("/(app)/(tabs)/profile")} />
        <QuickCard icon="calendar-clock" title="Book a session" desc={advisor ? "Meet your advisor" : "No advisor yet"} onPress={() => router.push("/(app)/appointments")} />
      </View>
      <NavRow icon="clipboard-text-clock-outline" title="My study plan" desc="Edit your semester plan · add or remove courses" label="Open my study plan" isDark={isDark} onPress={() => router.push("/(app)/study-plan")} />
      <NavRow
        icon="file-document-outline"
        title="Transcript & progress"
        desc={`${gpa != null ? `${gpa.toFixed(2)} GPA` : "No GPA yet"} · ${stats.earned}/${stats.total} credits`}
        label="Open transcript and academic progress"
        isDark={isDark}
        onPress={() => router.push("/(app)/transcript")}
        badge={profile.academicStatus === "PROBATION" ? (
          <View className="rounded-full px-2.5 py-1" style={{ backgroundColor: isDark ? "#3A2A0A" : "#FEF3C7" }}>
            <Text className="text-[10px] font-bold" style={{ color: isDark ? "#FCD34D" : "#92400E" }}>Warning</Text>
          </View>
        ) : undefined}
      />
    </View>
  );
}

/** Advisor section with retry. */
export function AdvisorSection({ advisor, advisorError, isDark, onRetry }: { advisor?: StudentAdvisor | null; advisorError: boolean; isDark: boolean; onRetry: () => void }) {
  return (
    <View className="px-5 pt-6">
      <SectionTitle title="Your advisor" />
      <View className="mt-3 rounded-3xl border border-line bg-surface p-4 dark:border-line-dark dark:bg-surface-dark" style={cardShadow(isDark)}>
        {advisorError ? (
          <View className="flex-row items-center gap-3">
            <MaterialCommunityIcons name="cloud-off-outline" size={24} color="#94A3B8" />
            <View className="flex-1">
              <Text className="text-sm font-semibold text-ink dark:text-ink-dark">Could not load your advisor</Text>
              <Text className="mt-0.5 text-xs text-ink-muted dark:text-ink-muted-dark">Check your connection and try again.</Text>
            </View>
            <Pressable onPress={onRetry} hitSlop={8} className="rounded-full bg-raised px-3 py-1.5 active:opacity-70 dark:bg-raised-dark">
              <Text className="text-xs font-bold text-brand-ink dark:text-brand-ink-dark">Try again</Text>
            </Pressable>
          </View>
        ) : advisor ? (
          <View className="flex-row items-center gap-3">
            <View className="items-center justify-center rounded-full" style={{ width: 52, height: 52, backgroundColor: "#FFE5D4" }}>
              <Text className="text-lg font-bold" style={{ color: ORANGE_DEEP }}>{initials(advisor.fullName)}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-[15px] font-bold text-ink dark:text-ink-dark">{advisor.fullName}</Text>
              <Text className="mt-0.5 text-xs text-ink-muted dark:text-ink-muted-dark" numberOfLines={1}>{advisor.email}</Text>
              <View className="mt-1.5 self-start rounded-full bg-raised px-2.5 py-1 dark:bg-raised-dark">
                <Text className="text-[11px] font-semibold text-ink-muted dark:text-ink-muted-dark">{advisor.specialization ?? advisor.groupName ?? "Advisor"}</Text>
              </View>
            </View>
            <Pressable onPress={() => router.push("/(app)/advising")} accessibilityRole="button" accessibilityLabel={`Chat with ${advisor.fullName}`} className="h-11 w-11 items-center justify-center rounded-full active:opacity-70 active:scale-95" style={{ backgroundColor: ORANGE }}>
              <MaterialCommunityIcons name="chat-outline" size={20} color="#fff" />
            </Pressable>
          </View>
        ) : (
          <Text className="text-sm text-ink-muted dark:text-ink-muted-dark">You have not been assigned an advisor yet. Contact the Academic Office for support.</Text>
        )}
      </View>
    </View>
  );
}

/** Latest reminders. */
export function RemindersSection({ notifications, unreadCount }: { notifications?: NotificationPage; unreadCount: number }) {
  if (!notifications || notifications.items.length === 0) return null;
  return (
    <View className="px-5 pt-6">
      <SectionTitle title="Reminders" action={`${unreadCount} new`} onPress={() => router.push("/(app)/notifications")} />
      <View className="mt-3 overflow-hidden rounded-3xl border border-line bg-surface dark:border-line-dark dark:bg-surface-dark">
        {notifications.items.slice(0, 3).map((n: AppNotification, i: number) => (
          <View key={n.id}>
            <View className="flex-row items-start gap-3 p-4">
              <View className="mt-1.5 h-2.5 w-2.5 rounded-full" style={{ backgroundColor: NOTIFICATION_DOT[n.notificationType] ?? "#9CA3AF" }} />
              <View className="flex-1">
                <View className="flex-row items-center justify-between gap-2">
                  <Text className="flex-1 text-sm font-bold text-ink dark:text-ink-dark">{n.title}</Text>
                  {!n.isRead ? (
                    <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: "#FFF1E7" }}>
                      <Text className="text-[10px] font-bold" style={{ color: ORANGE_DEEP }}>NEW</Text>
                    </View>
                  ) : null}
                </View>
                <Text className="mt-1 text-[13px] leading-5 text-ink-muted dark:text-ink-muted-dark" numberOfLines={2}>{n.message}</Text>
                <Text className="mt-1.5 text-[11px] text-ink-faint dark:text-ink-faint-dark">{NOTIFICATION_LABEL[n.notificationType] ?? n.notificationType} · {timeAgo(n.createdAt)}</Text>
              </View>
            </View>
            {i < Math.min(2, notifications.items.length - 1) ? <View className="ml-[30px] h-px bg-rule dark:bg-rule-dark" /> : null}
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
    <View className="pt-6">
      <View className="px-5">
        <SectionTitle title="Course catalog" action="Browse" onPress={() => router.push("/(app)/(tabs)/courses")} />
      </View>
      <View className="mt-3 flex-row gap-3 px-5">
        {courses.slice(0, 6).map((c) => (
          <Pressable key={c.id} onPress={() => router.push("/(app)/(tabs)/courses")} className="w-[200px] rounded-3xl border border-line bg-surface p-4 active:opacity-90 active:scale-[0.98] dark:border-line-dark dark:bg-surface-dark">
            <View className="flex-row items-center justify-between">
              <Text className="text-[11px] font-bold tracking-wide" style={{ color: ORANGE_DEEP }}>{c.code}</Text>
              <View className="rounded-full bg-raised px-2 py-0.5 dark:bg-raised-dark">
                <Text className="text-[10px] font-bold text-ink-muted dark:text-ink-muted-dark">{c.credits} cr</Text>
              </View>
            </View>
            <Text className="mt-2 min-h-[40px] text-sm font-bold leading-5 text-ink dark:text-ink-dark" numberOfLines={2}>{c.name}</Text>
            <View className="mt-3 flex-row items-center gap-1">
              <MaterialCommunityIcons name="arrow-right" size={14} color={ORANGE} />
              <Text className="text-xs font-semibold" style={{ color: ORANGE }}>View details</Text>
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
    <View className="mx-5 mt-6 rounded-3xl bg-raised p-4 dark:bg-raised-dark">
      <View className="flex-row items-center justify-between">
        <Text className="text-xs font-semibold text-ink-muted dark:text-ink-muted-dark">{profile.majorName ?? "FAAPS"}</Text>
        <Text className="text-xs text-ink-faint dark:text-ink-faint-dark">{profile.cohort ?? ""}</Text>
      </View>
      <View className="mt-3">
        <Progress value={stats.pct} color="primary" />
      </View>
      <Text className="mt-2 text-center text-[11px] text-ink-faint dark:text-ink-faint-dark">FAAPS · FPT University HCMC — walking with you to graduation</Text>
    </View>
  );
}
