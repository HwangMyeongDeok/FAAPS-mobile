/**
 * FE-S-3 — Transcript & academic progress.
 *
 * The screen answers one question: "Where am I standing right now — how did
 * my semesters go, and how many credits are left until graduation?"
 *
 * Layout for one hand: warning banner → hero GPA/credits → semester
 * accordions. Every token follows the FAAPS theme (ground/surface/brand-tint)
 * with full dark-mode support via `dark:` variants + inline styles.
 */

import { useMemo, useState } from "react";
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

import { ScreenHeader, goBack } from "@/components/ScreenHeader";
import { Skeleton } from "@/components/ui";
import { useMyProfile, useMyProgress } from "@/lib/queries/profile";
import { useTranscript } from "@/lib/queries/transcript";
import type { TranscriptRow } from "@/types";

const ORANGE = "#F36F21";
const ORANGE_DEEP = "#B5460D";

// ── Semantic tones ───────────────────────────────────────────────────────────
// Probation/warning uses amber — a warning, not an error. A failing grade
// uses red. A good grade uses green. Every tone has a light and dark pair.

function gradeTone(grade: number | null, isDark: boolean): { bg: string; fg: string } {
  const value = grade ?? 0;
  if (value >= 8) {
    return isDark
      ? { bg: "#0B2E1F", fg: "#6EE7B7" }
      : { bg: "#DCFCE7", fg: "#047857" };
  }
  if (value >= 6.5) {
    return isDark
      ? { bg: "#2E1C0E", fg: "#FFA371" }
      : { bg: "#FFF1E7", fg: ORANGE_DEEP };
  }
  if (value >= 5) {
    return isDark
      ? { bg: "#3A2A0A", fg: "#FCD34D" }
      : { bg: "#FEF3C7", fg: "#92400E" };
  }
  return isDark
    ? { bg: "#3B0F0F", fg: "#FCA5A5" }
    : { bg: "#FEE2E2", fg: "#DC2626" };
}

/** The semesters of the transcript, newest first, with their rows. */
interface TranscriptSemester {
  key: string;
  label: string;
  code: string;
  rows: TranscriptRow[];
  credits: number;
  earnedCredits: number;
  gpa: number | null;
}

function groupBySemester(rows: TranscriptRow[]): TranscriptSemester[] {
  const map = new Map<string, TranscriptRow[]>();
  for (const row of rows) {
    const arr = map.get(row.semesterCode) ?? [];
    arr.push(row);
    map.set(row.semesterCode, arr);
  }

  return Array.from(map.entries()).map(([code, list]) => {
    const credits = list.reduce((s, r) => s + r.credits, 0);
    const earnedCredits = list.reduce((s, r) => s + (r.creditsEarned ?? 0), 0);
    const weighted = list.reduce(
      (s, r) => s + (r.finalScore ?? 0) * r.credits,
      0,
    );
    return {
      key: code,
      label: list[0]?.semesterName ?? code,
      code,
      rows: list,
      credits,
      earnedCredits,
      gpa: credits === 0 ? null : Math.round((weighted / credits) * 100) / 100,
    };
  });
}

export default function TranscriptScreen() {
  const isDark = useColorScheme() === "dark";

  const { data: profile } = useMyProfile();
  const { data: progress } = useMyProgress();
  const {
    data: transcript = [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useTranscript();

  // The newest semester starts open, older ones collapse so the screen stays
  // readable on a small phone.
  const semesters = useMemo(() => groupBySemester(transcript), [transcript]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const stats = useMemo(() => {
    let attempted = 0;
    let earned = 0;
    let courses = 0;
    let failed = 0;
    for (const sem of semesters) {
      for (const c of sem.rows) {
        attempted += c.credits;
        courses += 1;
        if (c.status === "PASSED" || c.status === "EXEMPTED") {
          earned += c.creditsEarned ?? c.credits;
        } else if (c.status === "FAILED") {
          failed += 1;
        }
      }
    }
    return { attempted, earned, courses, failed };
  }, [semesters]);

  // The graduation figures come from the official progress record, so the
  // numbers never drift from the home screen.
  const grad = useMemo(() => {
    const earned = progress?.earnedCredits ?? profile?.totalCreditsEarned ?? 0;
    const total = progress?.requiredCredits ?? 0;
    const pct = total === 0 ? 0 : Math.min(100, Math.round((earned / total) * 100));
    return { earned, total, pct, left: Math.max(0, total - earned) };
  }, [progress, profile]);

  if (isLoading) {
    return (
      <SafeAreaView
        className="flex-1 bg-ground dark:bg-ground-dark"
        edges={["top"]}
      >
        <ScreenHeader
          title="Transcript"
          subtitle="Your academic results & graduation progress"
          onBack={goBack}
        />
        <View className="px-5 pt-4">
          <Skeleton height={210} className="rounded-[28px]" />
          <Skeleton height={120} className="mt-4 rounded-3xl" />
          <Skeleton height={76} className="mt-4 rounded-3xl" />
          <Skeleton height={76} className="mt-3 rounded-3xl" />
          <View className="mt-6 items-center">
            <ActivityIndicator color={ORANGE} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView
        className="flex-1 bg-ground dark:bg-ground-dark"
        edges={["top"]}
      >
        <ScreenHeader
          title="Transcript"
          subtitle="Your academic results & graduation progress"
          onBack={goBack}
        />
        <View className="flex-1 items-center justify-center px-8">
          <MaterialCommunityIcons
            name="cloud-off-outline"
            size={44}
            color="#CBD5E1"
          />
          <Text className="mt-3 text-center text-sm text-ink-muted dark:text-ink-muted-dark">
            Could not load your transcript. Pull down to try again.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const onProbation = profile?.academicStatus === "PROBATION";
  const failedCourses = semesters
    .flatMap((s) => s.rows.filter((c) => c.status === "FAILED"))
    .map((c) => c.courseCode);
  const cumulativeGpa = progress?.currentGpa ?? profile?.currentGpa ?? null;

  return (
    <SafeAreaView
      className="flex-1 bg-ground dark:bg-ground-dark"
      edges={["top"]}
    >
      <ScreenHeader
        title="Transcript"
        subtitle={`${profile?.studentCode ?? ""} · ${profile?.cohort ?? ""}`}
        onBack={goBack}
        right={
          <View
            className="rounded-full px-3 py-1.5"
            style={{ backgroundColor: isDark ? "#2E1C0E" : "#FFF1E7" }}
          >
            <Text
              className="text-[11px] font-bold"
              style={{ color: isDark ? "#FFA371" : ORANGE_DEEP }}
            >
              {semesters.length} terms · {stats.courses} courses
            </Text>
          </View>
        }
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => {
              refetch();
            }}
            tintColor={ORANGE}
          />
        }
      >
        {/* ── 1. Academic warning — always first when on probation ── */}
        {onProbation ? (
          <View className="px-5 pt-4">
            <View
              className="overflow-hidden rounded-3xl border p-4"
              style={{
                backgroundColor: isDark ? "#2A1E05" : "#FFFBEB",
                borderColor: isDark ? "#B45309" : "#F59E0B",
              }}
            >
              <View className="flex-row items-center gap-3">
                <View
                  className="h-11 w-11 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: "#F59E0B" }}
                >
                  <MaterialCommunityIcons
                    name="alert-decagram"
                    size={22}
                    color="#FFFFFF"
                  />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-sm font-bold"
                    style={{ color: isDark ? "#FCD34D" : "#92400E" }}
                  >
                    Academic warning · PROBATION
                  </Text>
                  <Text
                    className="mt-0.5 text-[11px] leading-4"
                    style={{ color: isDark ? "#E7C46B" : "#92600E" }}
                  >
                    {failedCourses.length > 0
                      ? `You did not pass ${failedCourses.join(", ")}. Meet your advisor to build a recovery plan before the next registration.`
                      : "Your academic standing needs attention. Meet your advisor to build a recovery plan."}
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => router.push("/(app)/advising")}
                accessibilityRole="button"
                accessibilityLabel="Talk to your advisor about the academic warning"
                className="mt-3 flex-row items-center justify-center gap-2 rounded-2xl py-3 active:opacity-85"
                style={{ backgroundColor: "#F59E0B" }}
              >
                <MaterialCommunityIcons name="chat-outline" size={16} color="#FFFFFF" />
                <Text className="text-[13px] font-bold text-white">
                  Talk to your advisor
                </Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {/* ── 2. Hero: cumulative GPA + credit progress (flat orange) ── */}
        <View className="px-5 pt-4">
          <View
            className="overflow-hidden rounded-[28px] p-5"
            style={{ backgroundColor: ORANGE }}
          >
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
              <View
                className="rounded-full px-3 py-1.5"
                style={{ backgroundColor: "rgba(255,255,255,0.22)" }}
              >
                <Text className="text-[11px] font-bold text-white">
                  Cumulative · {stats.courses} courses
                </Text>
              </View>
              <View
                className="rounded-full px-3 py-1.5"
                style={{ backgroundColor: "rgba(255,255,255,0.22)" }}
              >
                <Text className="text-[11px] font-bold text-white">
                  {cumulativeGpa == null
                    ? "No GPA yet"
                    : cumulativeGpa >= 8
                      ? "Excellent"
                      : cumulativeGpa >= 6.5
                        ? "Good"
                        : cumulativeGpa >= 5
                          ? "Average"
                          : "Needs improvement"}
                </Text>
              </View>
            </View>

            <View className="mt-4 flex-row items-end justify-between">
              <View>
                <Text
                  className="text-xs font-medium"
                  style={{ color: "rgba(255,255,255,0.85)" }}
                >
                  Cumulative GPA
                </Text>
                <View className="flex-row items-baseline gap-1">
                  <Text className="text-[52px] font-bold leading-[56px] text-white tabular-nums">
                    {cumulativeGpa != null ? cumulativeGpa.toFixed(2) : "—"}
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
                <Text className="text-2xl font-bold text-white tabular-nums">
                  {grad.earned}
                  <Text
                    className="text-sm font-medium"
                    style={{ color: "rgba(255,255,255,0.8)" }}
                  >
                    /{grad.total}
                  </Text>
                </Text>
                <Text
                  className="text-[11px] font-medium"
                  style={{ color: "rgba(255,255,255,0.85)" }}
                >
                  credits earned
                </Text>
              </View>
            </View>

            <View
              className="mt-3 h-2.5 w-full overflow-hidden rounded-full"
              style={{ backgroundColor: "rgba(255,255,255,0.3)" }}
            >
              <View
                className="h-full rounded-full bg-white"
                style={{ width: `${grad.pct}%` }}
              />
            </View>
            <Text
              className="mt-2 text-[11px] font-medium"
              style={{ color: "rgba(255,255,255,0.9)" }}
            >
              {grad.pct}% completed · {grad.left} credits left to graduate
            </Text>
          </View>
        </View>

        {/* ── 3. Semester overview ── */}
        {progress && progress.semesters.length > 0 ? (
          <View className="px-5 pt-4">
            <View className="rounded-3xl border border-line bg-surface p-4 dark:border-line-dark dark:bg-surface-dark">
              <Text className="text-[13px] font-bold text-ink dark:text-ink-dark">
                Semester overview
              </Text>
              <View className="mt-3 gap-2.5">
                {progress.semesters.map((s) => (
                  <View
                    key={s.code}
                    className="flex-row items-center justify-between"
                  >
                    <View className="flex-1">
                      <Text className="text-xs font-semibold text-ink dark:text-ink-dark">
                        {s.name}
                      </Text>
                      <Text className="text-[11px] text-ink-muted dark:text-ink-muted-dark">
                        {s.creditsEarned}/{s.creditsEnrolled} credits
                      </Text>
                    </View>
                    <Text className="text-[13px] font-bold tabular-nums text-ink dark:text-ink-dark">
                      {s.semesterGpa != null ? s.semesterGpa.toFixed(2) : "—"}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        ) : null}

        {/* ── 4. Transcript by semester ── */}
        <View className="px-5 pt-6">
          <View className="flex-row items-end justify-between">
            <Text className="text-[15px] font-bold text-ink dark:text-ink-dark">
              Results by semester
            </Text>
            {stats.failed > 0 ? (
              <Text className="text-[11px] font-bold" style={{ color: "#DC2626" }}>
                {stats.failed} not passed
              </Text>
            ) : null}
          </View>

          {semesters.length === 0 ? (
            <View className="mt-3 items-center rounded-3xl border border-dashed border-line bg-surface px-6 py-8 dark:border-line-dark dark:bg-surface-dark">
              <MaterialCommunityIcons
                name="file-document-outline"
                size={36}
                color="#CBD5E1"
              />
              <Text className="mt-3 text-sm font-bold text-ink dark:text-ink-dark">
                No results yet
              </Text>
              <Text className="mt-1 text-center text-xs leading-4 text-ink-muted dark:text-ink-muted-dark">
                Your transcript will appear here once your first semester is
                graded.
              </Text>
            </View>
          ) : (
            <View className="mt-3 gap-3">
              {semesters.map((sem, index) => (
                <SemesterCard
                  key={sem.key}
                  semester={sem}
                  isDark={isDark}
                  open={expanded[sem.key] ?? index === 0}
                  onToggle={() =>
                    setExpanded((p) => ({ ...p, [sem.key]: !(p[sem.key] ?? index === 0) }))
                  }
                />
              ))}
            </View>
          )}

          <Text className="mt-4 text-center text-[11px] leading-4 text-ink-faint dark:text-ink-faint-dark">
            Scores are on a 10-point scale · a course below 5.00 is not passed
            and must be retaken
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Semester accordion ───────────────────────────────────────────────────────

function SemesterCard({
  semester,
  isDark,
  open,
  onToggle,
}: {
  semester: TranscriptSemester;
  isDark: boolean;
  open: boolean;
  onToggle: () => void;
}) {
  const tone = gradeTone(semester.gpa, isDark);

  return (
    <View className="overflow-hidden rounded-3xl border border-line bg-surface dark:border-line-dark dark:bg-surface-dark">
      <Pressable
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityLabel={`${open ? "Collapse" : "Expand"} ${semester.label} results`}
        className="flex-row items-center gap-3 p-4 active:opacity-80"
      >
        <View
          className="h-11 w-11 items-center justify-center rounded-2xl"
          style={{ backgroundColor: isDark ? "#241F1B" : "#F2EDE7" }}
        >
          <MaterialCommunityIcons
            name="calendar-month-outline"
            size={22}
            color={isDark ? "#FFA371" : ORANGE}
          />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-bold text-ink dark:text-ink-dark">
            {semester.label}
          </Text>
          <Text className="mt-0.5 text-[11px] text-ink-muted dark:text-ink-muted-dark">
            {semester.rows.length} courses · {semester.credits} credits
          </Text>
        </View>
        <View className="rounded-full px-3 py-1.5" style={{ backgroundColor: tone.bg }}>
          <Text
            className="text-[12px] font-bold tabular-nums"
            style={{ color: tone.fg }}
          >
            {semester.gpa != null ? semester.gpa.toFixed(2) : "—"}
          </Text>
        </View>
        <MaterialCommunityIcons
          name={open ? "chevron-up" : "chevron-down"}
          size={20}
          color={isDark ? "#A79C93" : "#8B8178"}
        />
      </Pressable>

      {open ? (
        <View className="px-4 pb-2">
          <View className="h-px bg-rule dark:bg-rule-dark" />
          {semester.rows.map((c, i) => (
            <CourseRow
              key={c.id}
              course={c}
              isDark={isDark}
              last={i === semester.rows.length - 1}
            />
          ))}
          <View className="flex-row items-center justify-between py-3">
            <Text className="text-[11px] font-medium text-ink-muted dark:text-ink-muted-dark">
              Semester GPA · {semester.label}
            </Text>
            <Text
              className="text-[13px] font-bold tabular-nums"
              style={{ color: tone.fg }}
            >
              {semester.gpa != null ? semester.gpa.toFixed(2) : "—"}
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

function CourseRow({
  course,
  isDark,
  last,
}: {
  course: TranscriptRow;
  isDark: boolean;
  last: boolean;
}) {
  const tone = gradeTone(course.finalScore, isDark);
  const failed = course.status === "FAILED";

  return (
    <View
      className={`flex-row items-center gap-3 py-3 ${last ? "" : "border-b border-rule dark:border-rule-dark"}`}
    >
      <View className="flex-1">
        <View className="flex-row items-center gap-2">
          <Text className="text-[13px] font-bold text-ink dark:text-ink-dark tabular-nums">
            {course.courseCode}
          </Text>
          {failed ? (
            <View
              className="rounded-full px-2 py-0.5"
              style={{ backgroundColor: tone.bg }}
            >
              <Text className="text-[10px] font-bold" style={{ color: tone.fg }}>
                FAILED
              </Text>
            </View>
          ) : null}
          {course.attemptNumber > 1 ? (
            <View className="rounded-full bg-raised px-2 py-0.5 dark:bg-raised-dark">
              <Text className="text-[10px] font-bold text-ink-muted dark:text-ink-muted-dark">
                Attempt {course.attemptNumber}
              </Text>
            </View>
          ) : null}
        </View>
        <Text
          className="mt-0.5 text-[12px] leading-4 text-ink-muted dark:text-ink-muted-dark"
          numberOfLines={2}
        >
          {course.courseName}
        </Text>
        <Text className="mt-0.5 text-[11px] text-ink-faint dark:text-ink-faint-dark tabular-nums">
          {course.credits} credits
        </Text>
      </View>
      <View
        className="min-w-[56px] items-center rounded-2xl px-2.5 py-2"
        style={{ backgroundColor: tone.bg }}
      >
        <Text
          className="text-[15px] font-bold tabular-nums"
          style={{ color: tone.fg }}
        >
          {course.finalScore != null ? course.finalScore.toFixed(1) : "—"}
        </Text>
      </View>
    </View>
  );
}
