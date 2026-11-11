/**
 * FE-S — Study plan.
 *
 * The screen's single question: "What am I taking next term, and is the plan
 * ready for my advisor to review?"
 *
 * The backend models a plan as one semester at a time: a plan belongs to a
 * semester, carries a version, a status and its own list of validation
 * issues. So the screen is a term-by-term list, and the editor works on one
 * term at a time — which matches how a student actually plans.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { ScreenHeader, goBack } from "@/components/ScreenHeader";
import { Sheet, Skeleton } from "@/components/ui";
import { usePlanSemesters, useSaveStudyPlan, useStudyPlans, useSubmitStudyPlan } from "@/lib/queries/planning";
import { useCurriculumCourses } from "@/modules/curriculum/hooks/useGroupedCourses";
import { useMyAdvisor } from "@/lib/queries/profile";
import type { CurriculumCourse, CurriculumPlan, PlanSemester } from "@/types";

const ORANGE = "#F36F21";
const ORANGE_DEEP = "#B5460D";

/** The status the backend reports for a plan the student still owns. */
type PlanStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED" | string;

/**
 * A course as the editor needs it: the curriculum row when we have it,
 * otherwise the plan's own row.
 */
interface CourseRow {
  courseId: string;
  code: string;
  name: string;
  credits: number;
  semesterNumber: number;
  mandatory: boolean;
}

function statusLabel(status: PlanStatus): string {
  switch (status?.toUpperCase()) {
    case "DRAFT":
      return "Draft";
    case "SUBMITTED":
    case "PENDING_REVIEW":
      return "Awaiting review";
    case "APPROVED":
      return "Approved";
    case "REJECTED":
      return "Changes requested";
    default:
      return "Draft";
  }
}

function statusTone(status: PlanStatus): { bg: string; fg: string } {
  switch (status?.toUpperCase()) {
    case "SUBMITTED":
    case "PENDING_REVIEW":
      return { bg: "#FFF1E7", fg: ORANGE_DEEP };
    case "APPROVED":
      return { bg: "#DCFCE7", fg: "#15803D" };
    case "REJECTED":
      return { bg: "#FEE2E2", fg: "#B91C1C" };
    default:
      return { bg: "#F2EDE7", fg: "#6A6058" };
  }
}

export default function StudyPlanScreen() {
  const isDark = useColorScheme() === "dark";

  const {
    data: plans = [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useStudyPlans();
  const { data: semesters = [] } = usePlanSemesters();
  const { data: advisor } = useMyAdvisor();
  const { data: curriculumCourses = [] } = useCurriculumCourses();

  const savePlan = useSaveStudyPlan();
  const submitPlan = useSubmitStudyPlan();

  /** The semester currently open in the editor. */
  const [editTarget, setEditTarget] = useState<PlanSemester | null>(null);
  const [sheetQuery, setSheetQuery] = useState("");

  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  /**
   * The plan of a semester, if the student already has one. The backend
   * returns the latest version of each semester's plan.
   */
  const planBySemester = useMemo(() => {
    const m = new Map<string, CurriculumPlan>();
    for (const p of plans) {
      const key = p.header.semesterId;
      const existing = m.get(key);
      if (!existing || p.header.version > existing.header.version) {
        m.set(key, p);
      }
    }
    return m;
  }, [plans]);

  /** Terms with a plan first, then the terms without one. */
  const orderedSemesters = useMemo(() => {
    const withPlan = semesters.filter((s) => planBySemester.has(s.id));
    const without = semesters.filter((s) => !planBySemester.has(s.id));
    return [...withPlan, ...without];
  }, [semesters, planBySemester]);

  const totals = useMemo(() => {
    let credits = 0;
    let courses = 0;
    let awaitingReview = 0;
    for (const p of plans) {
      credits += p.header.totalCredits ?? 0;
      courses += p.courses.length;
      if (["SUBMITTED", "PENDING_REVIEW"].includes(p.header.status?.toUpperCase())) {
        awaitingReview += 1;
      }
    }
    return { credits, courses, awaitingReview };
  }, [plans]);

  const openEditor = useCallback((semester: PlanSemester) => {
    setEditTarget(semester);
    setSheetQuery("");
  }, []);

  const handleSubmit = useCallback(
    (plan: CurriculumPlan) => {
      if (submitPlan.isPending) return;
      submitPlan.mutate(plan.header.id, {
        onSuccess: () => setToast("Plan sent to your advisor for review"),
        onError: () => setToast("Could not send the plan. Please try again."),
      });
    },
    [submitPlan],
  );

  /* ── Loading ─────────────────────────────────────────────────────── */
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-ground dark:bg-ground-dark" edges={["top"]}>
        <ScreenHeader title="Study plan" subtitle="Your terms and courses" onBack={goBack} />
        <PlanSkeleton />
      </SafeAreaView>
    );
  }

  /* ── Error ───────────────────────────────────────────────────────── */
  if (isError) {
    return (
      <SafeAreaView className="flex-1 bg-ground dark:bg-ground-dark" edges={["top"]}>
        <ScreenHeader title="Study plan" subtitle="Your terms and courses" onBack={goBack} />
        <View className="flex-1 items-center justify-center px-8">
          <MaterialCommunityIcons name="cloud-off-outline" size={44} color="#CBD5E1" />
          <Text className="mt-3 text-center text-sm text-ink-muted dark:text-ink-muted-dark">
            Could not load your study plan. Pull down to try again.
          </Text>
          <Pressable
            onPress={() => refetch()}
            accessibilityRole="button"
            accessibilityLabel="Try again"
            className="mt-4 rounded-full px-6 py-3 active:opacity-80"
            style={{ backgroundColor: ORANGE }}
          >
            <Text className="text-sm font-bold text-white">Try again</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const advisorName = advisor?.fullName ?? "Your advisor";

  return (
    <SafeAreaView className="flex-1 bg-ground dark:bg-ground-dark" edges={["top"]}>
      <ScreenHeader
        title="Study plan"
        subtitle={`${totals.courses} courses · ${totals.credits} credits planned`}
        onBack={goBack}
        right={
          totals.awaitingReview > 0 ? (
            <View className="rounded-full px-3 py-1.5" style={{ backgroundColor: "#FFF1E7" }}>
              <Text className="text-[11px] font-bold" style={{ color: ORANGE_DEEP }}>
                {totals.awaitingReview} in review
              </Text>
            </View>
          ) : undefined
        }
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
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
        {/* ── Summary strip: three numbers, one divided card ───────── */}
        <View className="px-5 pt-4">
          <View className="flex-row rounded-3xl border border-line bg-surface dark:border-line-dark dark:bg-surface-dark">
            <View className="flex-1 items-center py-4">
              <Text className="text-[11px] font-medium text-ink-muted dark:text-ink-muted-dark">
                Terms
              </Text>
              <Text className="mt-1 text-xl font-bold text-ink tabular-nums dark:text-ink-dark">
                {semesters.length}
              </Text>
            </View>
            <View className="w-px bg-line dark:bg-line-dark" />
            <View className="flex-1 items-center py-4">
              <Text className="text-[11px] font-medium text-ink-muted dark:text-ink-muted-dark">
                Credits
              </Text>
              <Text className="mt-1 text-xl font-bold text-ink tabular-nums dark:text-ink-dark">
                {totals.credits}
              </Text>
            </View>
            <View className="w-px bg-line dark:bg-line-dark" />
            <View className="flex-1 items-center py-4">
              <Text className="text-[11px] font-medium text-ink-muted dark:text-ink-muted-dark">
                Awaiting review
              </Text>
              <Text className="mt-1 text-xl font-bold text-ink tabular-nums dark:text-ink-dark">
                {totals.awaitingReview}
              </Text>
            </View>
          </View>
        </View>

        {/* ── The terms ─────────────────────────────────────────────── */}
        <View className="px-5 pt-6">
          <Text className="text-[15px] font-bold text-ink dark:text-ink-dark">
            Your terms
          </Text>
          <Text className="mt-0.5 text-[12px] text-ink-muted dark:text-ink-muted-dark">
            Tap a term to plan its courses
          </Text>

          {orderedSemesters.length === 0 ? (
            <View className="mt-4 items-center rounded-3xl border border-dashed px-6 py-10"
              style={{ borderColor: isDark ? "#302A24" : "#EAE1D8" }}
            >
              <MaterialCommunityIcons name="calendar-blank-outline" size={38} color="#CBD5E1" />
              <Text className="mt-3 text-center text-[13px] text-ink-muted dark:text-ink-muted-dark">
                No semesters have been published yet. Check back once the
                registrar opens term registration.
              </Text>
            </View>
          ) : (
            <View className="mt-3 gap-3">
              {orderedSemesters.map((semester) => (
                <TermCard
                  key={semester.id}
                  semester={semester}
                  plan={planBySemester.get(semester.id) ?? null}
                  isDark={isDark}
                  advisorName={advisorName}
                  busy={submitPlan.isPending}
                  onEdit={() => openEditor(semester)}
                  onSubmit={() => {
                    const plan = planBySemester.get(semester.id);
                    if (plan) handleSubmit(plan);
                  }}
                />
              ))}
            </View>
          )}
        </View>

        <Text className="mt-6 px-5 text-center text-[11px] leading-4 text-ink-faint dark:text-ink-faint-dark">
          Keep each term to 14–18 credits so you stay on track for graduation.
        </Text>
      </ScrollView>

      {toast ? (
        <View className="absolute left-5 right-5 top-2 items-center" pointerEvents="none">
          <View
            className="rounded-full px-4 py-2.5"
            style={{ backgroundColor: isDark ? "#1B1815" : "#191512" }}
          >
            <Text className="text-xs font-semibold text-white">{toast}</Text>
          </View>
        </View>
      ) : null}

      {/* ── Course editor ─────────────────────────────────────────────── */}
      <Sheet
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        maxHeightRatio={0.9}
      >
        {editTarget ? (
          <EditorSheet
            semester={editTarget}
            plan={planBySemester.get(editTarget.id) ?? null}
            curriculum={curriculumCourses}
            query={sheetQuery}
            onQuery={setSheetQuery}
            isDark={isDark}
            saving={savePlan.isPending}
            onClose={() => setEditTarget(null)}
            onSave={(courseIds) => {
              savePlan.mutate(
                {
                  semesterId: editTarget.id,
                  planType: "REGULAR",
                  courseIds,
                },
                {
                  onSuccess: () => {
                    setEditTarget(null);
                    setToast("Draft saved");
                  },
                  onError: () => setToast("Could not save the draft. Please try again."),
                },
              );
            }}
          />
        ) : null}
      </Sheet>
    </SafeAreaView>
  );
}

/* ═════════════════════════════════════════════════════════════════════ */
/* One term                                                            */
/* ═════════════════════════════════════════════════════════════════════ */

function TermCard({
  semester,
  plan,
  isDark,
  advisorName,
  busy,
  onEdit,
  onSubmit,
}: {
  semester: PlanSemester;
  plan: CurriculumPlan | null;
  isDark: boolean;
  advisorName: string;
  busy: boolean;
  onEdit: () => void;
  onSubmit: () => void;
}) {
  const status = plan?.header.status ?? "DRAFT";
  const tone = statusTone(status);
  const issues = plan?.issues ?? [];
  const canSubmit = !!plan && !["SUBMITTED", "PENDING_REVIEW", "APPROVED"].includes(status.toUpperCase());

  return (
    <View className="overflow-hidden rounded-3xl border border-line bg-surface dark:border-line-dark dark:bg-surface-dark">
      <Pressable
        onPress={onEdit}
        accessibilityRole="button"
        accessibilityLabel={`Edit the plan for ${semester.name}`}
        className="p-4 active:opacity-80"
      >
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <Text className="text-[15px] font-bold text-ink dark:text-ink-dark" numberOfLines={1}>
              {semester.name}
            </Text>
            <Text className="mt-0.5 text-[11px] text-ink-muted dark:text-ink-muted-dark tabular-nums">
              {semester.code} · {semester.startDate} → {semester.endDate}
            </Text>
          </View>
          <View className="rounded-full px-2.5 py-1" style={{ backgroundColor: isDark ? "#241F1B" : tone.bg }}>
            <Text
              className="text-[10px] font-bold"
              style={{ color: isDark && tone.bg === "#F2EDE7" ? "#A79C93" : tone.fg }}
            >
              {statusLabel(status).toUpperCase()}
            </Text>
          </View>
        </View>

        {plan ? (
          <>
            <Text className="mt-2.5 text-[12px] text-ink-muted dark:text-ink-muted-dark tabular-nums">
              {plan.courses.length} courses · {plan.header.totalCredits} credits
              {plan.header.version > 1 ? ` · version ${plan.header.version}` : ""}
            </Text>

            <View className="mt-2.5 gap-1.5">
              {plan.courses.slice(0, 4).map((c) => (
                <View key={c.id} className="flex-row items-center gap-2">
                  <Text
                    className="text-[11px] font-bold tabular-nums"
                    style={{ color: isDark ? "#FFA371" : ORANGE_DEEP }}
                  >
                    {c.code}
                  </Text>
                  <Text
                    className="flex-1 text-[12px] text-ink dark:text-ink-dark"
                    numberOfLines={1}
                  >
                    {c.name}
                  </Text>
                  <Text className="text-[11px] text-ink-faint dark:text-ink-faint-dark tabular-nums">
                    {c.credits} cr
                  </Text>
                </View>
              ))}
              {plan.courses.length > 4 ? (
                <Text className="text-[11px] text-ink-faint dark:text-ink-faint-dark">
                  +{plan.courses.length - 4} more
                </Text>
              ) : null}
            </View>
          </>
        ) : (
          <Text className="mt-2.5 text-[12px] text-ink-faint dark:text-ink-faint-dark">
            No plan yet — tap to choose your courses.
          </Text>
        )}
      </Pressable>

      {/* Validation issues — the backend's own rules for this plan. */}
      {issues.length > 0 ? (
        <View
          className="mx-4 mb-3 rounded-2xl px-3 py-2.5"
          style={{ backgroundColor: isDark ? "#2A1E17" : "#FFF7ED" }}
        >
          {issues.slice(0, 3).map((issue, i) => (
            <View key={i} className="flex-row items-start gap-2 py-0.5">
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={14}
                color={isDark ? "#FFA371" : ORANGE_DEEP}
                style={{ marginTop: 1 }}
              />
              <Text className="flex-1 text-[11px] leading-[16px] text-ink-muted dark:text-ink-muted-dark">
                {issue}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      <View className="flex-row items-center gap-2 border-t border-line px-4 py-3 dark:border-line-dark">
        <Pressable
          onPress={onEdit}
          accessibilityRole="button"
          accessibilityLabel={`Edit the plan for ${semester.name}`}
          className="flex-1 items-center rounded-2xl border border-line py-3 active:opacity-70 dark:border-line-dark"
        >
          <Text className="text-[13px] font-bold text-ink dark:text-ink-dark">
            {plan ? "Edit courses" : "Choose courses"}
          </Text>
        </Pressable>

        {canSubmit ? (
          <Pressable
            onPress={onSubmit}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel={`Send the plan for ${semester.name} for review`}
            className="flex-1 flex-row items-center justify-center gap-1.5 rounded-2xl py-3 active:opacity-85"
            style={{ backgroundColor: ORANGE, opacity: busy ? 0.7 : 1 }}
          >
            {busy ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <MaterialCommunityIcons name="send" size={15} color="#fff" />
                <Text className="text-[13px] font-bold text-white">Send for review</Text>
              </>
            )}
          </Pressable>
        ) : null}
      </View>

      {plan && ["SUBMITTED", "PENDING_REVIEW"].includes(status.toUpperCase()) ? (
        <Text className="px-4 pb-3 text-[11px] text-ink-faint dark:text-ink-faint-dark">
          Waiting for {advisorName} to review this term.
        </Text>
      ) : null}
    </View>
  );
}

/* ═════════════════════════════════════════════════════════════════════ */
/* The editor                                                          */
/* ═════════════════════════════════════════════════════════════════════ */

function EditorSheet({
  semester,
  plan,
  curriculum,
  query,
  onQuery,
  isDark,
  saving,
  onClose,
  onSave,
}: {
  semester: PlanSemester;
  plan: CurriculumPlan | null;
  curriculum: CurriculumCourse[];
  query: string;
  onQuery: (q: string) => void;
  isDark: boolean;
  saving: boolean;
  onClose: () => void;
  onSave: (courseIds: string[]) => void;
}) {
  /**
   * The courses the student has picked, in the order they picked them.
   * The plan's course rows already carry the real course ids, so the
   * initial pick is the saved plan itself.
   */
  const [selected, setSelected] = useState<string[]>(() =>
    plan?.courses.map((c) => c.id) ?? [],
  );

  /**
   * The curriculum rows keyed by course id, merged with the plan's own
   * course rows so a course still renders even before the curriculum
   * query resolves.
   */
  const lookup = useMemo(() => {
    const m = new Map<string, CourseRow>();
    for (const c of curriculum) {
      m.set(c.courseId, {
        courseId: c.courseId,
        code: c.code,
        name: c.name,
        credits: c.credits,
        semesterNumber: c.semesterNumber,
        mandatory: c.mandatory,
      });
    }
    for (const c of plan?.courses ?? []) {
      if (!m.has(c.id)) {
        m.set(c.id, {
          courseId: c.id,
          code: c.code,
          name: c.name,
          credits: c.credits,
          semesterNumber: 0,
          mandatory: false,
        });
      }
    }
    return m;
  }, [curriculum, plan]);

  const candidates = useMemo(() => {
    const q = query.trim().toLowerCase();
    return curriculum
      .filter((c) => !selected.includes(c.courseId))
      .filter((c) =>
        q ? c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) : true,
      );
  }, [curriculum, selected, query]);

  const selectedCourses = useMemo(
    () =>
      selected
        .map((id) => lookup.get(id))
        .filter((c): c is CourseRow => !!c),
    [selected, lookup],
  );

  const totalCredits = selectedCourses.reduce((s, c) => s + c.credits, 0);

  const toggle = (course: CourseRow) => {
    setSelected((prev) =>
      prev.includes(course.courseId)
        ? prev.filter((id) => id !== course.courseId)
        : [...prev, course.courseId],
    );
  };

  return (
    <View>
      <Text className="text-lg font-bold text-ink dark:text-ink-dark">
        Plan {semester.name}
      </Text>
      <Text className="mt-1 text-[13px] text-ink-muted dark:text-ink-muted-dark">
        Pick the courses you want to register for this term.
      </Text>

      {/* ── The pick list ────────────────────────────────────────────── */}
      {selectedCourses.length > 0 ? (
        <View className="mt-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-[12px] font-bold text-ink dark:text-ink-dark">
              Selected
            </Text>
            <Text className="text-[12px] text-ink-muted dark:text-ink-muted-dark tabular-nums">
              {selectedCourses.length} courses · {totalCredits} credits
            </Text>
          </View>

          <View className="mt-2 gap-2">
            {selectedCourses.map((c) => (
              <View
                key={c.courseId}
                className="flex-row items-center gap-3 rounded-2xl border border-line bg-surface px-3.5 py-3 dark:border-line-dark dark:bg-surface-dark"
              >
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-[11px] font-bold" style={{ color: ORANGE_DEEP }}>
                      {c.code}
                    </Text>
                    <Text className="text-[11px] text-ink-faint dark:text-ink-faint-dark tabular-nums">
                      {c.credits} cr
                    </Text>
                    {c.mandatory ? (
                      <View
                        className="rounded-full px-2 py-0.5"
                        style={{ backgroundColor: isDark ? "#2E1C0E" : "#FFF1E7" }}
                      >
                        <Text
                          className="text-[10px] font-bold"
                          style={{ color: isDark ? "#FFA371" : ORANGE_DEEP }}
                        >
                          REQUIRED
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <Text
                    className="mt-0.5 text-[13px] font-semibold text-ink dark:text-ink-dark"
                    numberOfLines={2}
                  >
                    {c.name}
                  </Text>
                </View>
                <Pressable
                  onPress={() => toggle(c)}
                  hitSlop={12}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${c.code} from the plan`}
                  className="h-10 w-10 items-center justify-center rounded-full active:opacity-70"
                  style={{ backgroundColor: isDark ? "#241F1B" : "#F2EDE7" }}
                >
                  <MaterialCommunityIcons name="close" size={18} color="#B5460D" />
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {/* ── Search ───────────────────────────────────────────────────── */}
      <View className="mt-4 flex-row items-center gap-2 rounded-2xl border border-line bg-surface px-3 py-2.5 dark:border-line-dark">
        <MaterialCommunityIcons name="magnify" size={18} color="#8B8178" />
        <TextInput
          value={query}
          onChangeText={onQuery}
          placeholder="Search by course code or name…"
          placeholderTextColor="#8B8178"
          autoCapitalize="none"
          autoCorrect={false}
          className="flex-1 text-sm text-ink dark:text-ink-dark"
        />
        {query.length > 0 ? (
          <Pressable onPress={() => onQuery("")} hitSlop={8}>
            <MaterialCommunityIcons name="close-circle" size={18} color="#8B8178" />
          </Pressable>
        ) : null}
      </View>

      {candidates.length === 0 ? (
        <View className="items-center py-8">
          <MaterialCommunityIcons name="book-search-outline" size={38} color="#CBD5E1" />
          <Text className="mt-3 text-center text-[13px] text-ink-muted dark:text-ink-muted-dark">
            {curriculum.length === 0
              ? "Your curriculum is not available yet."
              : "No other course matches your search."}
          </Text>
        </View>
      ) : (
        <View className="mt-3 gap-2">
          {candidates.map((c) => (
            <Pressable
              key={c.courseId}
              onPress={() => toggle(c)}
              accessibilityRole="button"
              accessibilityLabel={`Add ${c.code} to the plan`}
              className="flex-row items-center gap-3 rounded-2xl border border-line px-3.5 py-3 active:opacity-70 dark:border-line-dark"
            >
              <View className="flex-1">
                <View className="flex-row items-center gap-2">
                  <Text className="text-[11px] font-bold" style={{ color: ORANGE_DEEP }}>
                    {c.code}
                  </Text>
                  <Text className="text-[11px] text-ink-faint dark:text-ink-faint-dark tabular-nums">
                    {c.credits} cr
                  </Text>
                  {c.semesterNumber ? (
                    <Text className="text-[11px] text-ink-faint dark:text-ink-faint-dark">
                      · term {c.semesterNumber}
                    </Text>
                  ) : null}
                </View>
                <Text
                  className="mt-0.5 text-[13px] font-semibold text-ink dark:text-ink-dark"
                  numberOfLines={2}
                >
                  {c.name}
                </Text>
              </View>
              <View
                className="h-9 w-9 items-center justify-center rounded-full"
                style={{ backgroundColor: ORANGE }}
              >
                <MaterialCommunityIcons name="plus" size={18} color="#fff" />
              </View>
            </Pressable>
          ))}
        </View>
      )}

      <Pressable
        onPress={() => onSave(selected)}
        disabled={saving || selected.length === 0}
        accessibilityRole="button"
        accessibilityLabel="Save the plan draft"
        className="mt-4 flex-row items-center justify-center gap-2 rounded-2xl py-4 active:opacity-85"
        style={{
          backgroundColor: ORANGE,
          opacity: saving || selected.length === 0 ? 0.5 : 1,
        }}
      >
        {saving ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            <MaterialCommunityIcons name="content-save-outline" size={17} color="#fff" />
            <Text className="text-sm font-bold text-white">Save draft</Text>
          </>
        )}
      </Pressable>

      <Pressable
        onPress={onClose}
        className="mt-2 items-center rounded-2xl bg-raised py-4 active:opacity-80 dark:bg-raised-dark"
      >
        <Text className="text-sm font-bold text-ink dark:text-ink-dark">Cancel</Text>
      </Pressable>
    </View>
  );
}

function PlanSkeleton() {
  return (
    <View className="px-5 pt-4">
      <Skeleton height={76} className="rounded-3xl" />
      <View className="mt-4 gap-3">
        <Skeleton height={150} className="rounded-3xl" />
        <Skeleton height={150} className="rounded-3xl" />
        <Skeleton height={150} className="rounded-3xl" />
      </View>
      <View className="mt-6 items-center">
        <ActivityIndicator color={ORANGE} />
      </View>
    </View>
  );
}
