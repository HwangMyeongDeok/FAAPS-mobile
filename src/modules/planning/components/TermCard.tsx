import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import type { CurriculumPlan, PlanSemester } from "@/types";
import { ORANGE, statusLabel, statusTone } from "../format";

interface TermCardProps {
  semester: PlanSemester;
  plan: CurriculumPlan | null;
  isDark: boolean;
  advisorName: string;
  busy: boolean;
  onEdit: () => void;
  onSubmit: () => void;
}

/** One term card: status pill, course preview, validation issues, actions. */
export function TermCard({
  semester,
  plan,
  isDark,
  advisorName,
  busy,
  onEdit,
  onSubmit,
}: TermCardProps) {
  const status = plan?.header.status ?? "DRAFT";
  const tone = statusTone(status);
  const issues = plan?.issues ?? [];
  const canSubmit =
    !!plan &&
    !["SUBMITTED", "PENDING_REVIEW", "APPROVED"].includes(status.toUpperCase());

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
            <Text
              className="text-[15px] font-bold text-ink dark:text-ink-dark"
              numberOfLines={1}
            >
              {semester.name}
            </Text>
            <Text className="mt-0.5 text-[11px] text-ink-muted tabular-nums dark:text-ink-muted-dark">
              {semester.code} · {semester.startDate} → {semester.endDate}
            </Text>
          </View>
          <View
            className="rounded-full px-2.5 py-1"
            style={{ backgroundColor: isDark ? "#241F1B" : tone.bg }}
          >
            <Text
              className="text-[10px] font-bold"
              style={{
                color: isDark && tone.bg === "#F2EDE7" ? "#A79C93" : tone.fg,
              }}
            >
              {statusLabel(status).toUpperCase()}
            </Text>
          </View>
        </View>

        {plan ? (
          <>
            <Text className="mt-2.5 text-[12px] text-ink-muted tabular-nums dark:text-ink-muted-dark">
              {plan.courses.length} courses · {plan.header.totalCredits} credits
              {plan.header.version > 1 ? ` · version ${plan.header.version}` : ""}
            </Text>

            <View className="mt-2.5 gap-1.5">
              {plan.courses.slice(0, 4).map((c) => (
                <View key={c.id} className="flex-row items-center gap-2">
                  <Text
                    className="text-[11px] font-bold tabular-nums"
                    style={{ color: isDark ? "#FFA371" : "#B5460D" }}
                  >
                    {c.code}
                  </Text>
                  <Text
                    className="flex-1 text-[12px] text-ink dark:text-ink-dark"
                    numberOfLines={1}
                  >
                    {c.name}
                  </Text>
                  <Text className="text-[11px] text-ink-faint tabular-nums dark:text-ink-faint-dark">
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
                color={isDark ? "#FFA371" : "#B5460D"}
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
                <Text className="text-[13px] font-bold text-white">
                  Send for review
                </Text>
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
