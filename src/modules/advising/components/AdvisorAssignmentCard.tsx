/**
 * AdvisorAssignmentCard — the "you have no advisor yet" panel.
 *
 * The backend state comes from `GET /api/student/advisor-assignment`:
 *   • `advisorId` null          → the student has no advisor,
 *   • `pendingRequestId` set    → a request to the admins is still open.
 *
 * DESIGN:
 * - Card trắng bo góc 16px, shadow nhẹ 0 1px 3px rgba(0,0,0,0.05).
 * - Accent cam FPT #F37021 (nền #FFF1E7 / chữ #B45309).
 * - Button bo góc 12px, cao 48px, font 600.
 */
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { cardShadow } from "@/lib/shadow";
import { ORANGE, ORANGE_DEEP } from "@/modules/advising/format";

interface AdvisorAssignmentCardProps {
  /** The student already has an advisor — the card is not rendered. */
  hasAdvisor: boolean;
  /** A request sent to the admins is still waiting. */
  pending: boolean;
  /** The request call is in flight. */
  submitting: boolean;
  /** The request call failed. */
  error: string | null;
  isDark: boolean;
  onRequest: () => void;
}

/**
 * The card that asks for an advisor, or reports that the request is already
 * waiting for the academic office.
 */
export function AdvisorAssignmentCard({
  hasAdvisor,
  pending,
  submitting,
  error,
  isDark,
  onRequest,
}: AdvisorAssignmentCardProps) {
  // A student with an advisor has nothing to ask for here.
  if (hasAdvisor) return null;

  return (
    <View
      className="rounded-3xl border border-line bg-surface p-4 dark:border-line-dark dark:bg-surface-dark"
      style={cardShadow(isDark)}
    >
      <View className="flex-row items-start gap-3">
        <View
          className="h-11 w-11 items-center justify-center rounded-full"
          style={{ backgroundColor: isDark ? "#2E1C0E" : "#FFE5D4" }}
        >
          <MaterialCommunityIcons
            name="account-tie-outline"
            size={21}
            color={isDark ? "#FFA371" : ORANGE_DEEP}
          />
        </View>
        <View className="flex-1">
          <Text className="text-[15px] font-bold text-ink dark:text-ink-dark">
            Bạn chưa có Cố vấn học tập
          </Text>
          <Text className="mt-1 text-xs leading-4 text-ink-muted dark:text-ink-muted-dark">
            {pending
              ? "Yêu cầu của bạn đã được gửi tới Bộ phận Đào tạo. Cố vấn sẽ được phân công trong thời gian sớm nhất."
              : "Gửi yêu cầu để Bộ phận Đào tạo phân công Cố vấn học tập cho bạn."}
          </Text>
        </View>
      </View>

      {pending ? (
        <View
          className="mt-3 flex-row items-center gap-2 rounded-2xl px-3.5 py-3"
          style={{ backgroundColor: isDark ? "#3A2A10" : "#FFF4E6" }}
        >
          <MaterialCommunityIcons name="clock-outline" size={16} color={ORANGE} />
          <Text
            className="flex-1 text-xs font-semibold"
            style={{ color: isDark ? "#FFD9B8" : "#8A4B12" }}
          >
            Đang chờ phân công
          </Text>
        </View>
      ) : (
        <Pressable
          onPress={onRequest}
          disabled={submitting}
          accessibilityRole="button"
          accessibilityLabel="Gửi yêu cầu xin Cố vấn"
          className="mt-3 flex-row items-center justify-center gap-2 active:opacity-85"
          style={{
            height: 48,
            borderRadius: 12,
            backgroundColor: ORANGE,
            opacity: submitting ? 0.6 : 1,
          }}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <MaterialCommunityIcons name="send-outline" size={17} color="#FFFFFF" />
              <Text className="text-[15px]" style={{ color: "#FFFFFF", fontWeight: "600" }}>
                Gửi yêu cầu xin Cố vấn
              </Text>
            </>
          )}
        </Pressable>
      )}

      {error ? (
        <Text className="mt-2 text-xs font-semibold" style={{ color: "#EF4444" }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}
