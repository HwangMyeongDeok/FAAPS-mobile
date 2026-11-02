/**
 * FE-S — Appointment Booking: đặt lịch hẹn 1-1 với cố vấn.
 *
 * Một màn hình trả lời: "Khi nào tôi gặp được advisor?"
 * Đặt lịch ở trên (lịch tháng + khung 30 phút + sheet lý do),
 * lịch sắp tới ở dưới với hủy kèm lý do — cùng một cuộn dọc,
 * mọi thao tác trong tầm ngón cái.
 */

import { useMemo, useState } from "react";
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
import { Sheet } from "@/components/ui/sheet";
import { useMyProfile } from "@/lib/queries/profile";
import {
  useAvailability,
  useBookAppointment,
  useCancelAppointment,
  useMyAppointments,
} from "@/lib/queries/appointments";
import type { Appointment, TimeSlot } from "@/lib/api/appointments";
import { useAuthStore } from "@/stores/auth";

const ORANGE = "#F36F21";
const ORANGE_DEEP = "#B5460D";

const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const MONTHS_VI = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];

const QUICK_REASONS = [
  "Tư vấn kế hoạch học tập",
  "Chọn chuyên ngành hẹp",
  "Đăng ký môn kỳ tới",
  "Cải thiện GPA / học lại",
  "Thực tập & định hướng nghề",
];

const CANCEL_REASONS = [
  "Bận lịch học đột xuất",
  "Đã trao đổi qua tin nhắn",
  "Muốn đổi sang khung giờ khác",
  "Lý do cá nhân",
];

// ── Date helpers (pure, no dep) ──────────────────────────────────────────────

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseISO(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function viLong(dateStr: string): string {
  const d = parseISO(dateStr);
  const names = ["Chủ nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
  return `${names[d.getDay()]}, ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

function viShort(dateStr: string): { day: string; mon: string; dow: string } {
  const d = parseISO(dateStr);
  const dows = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  return {
    day: `${d.getDate()}`.padStart(2, "0"),
    mon: `T${d.getMonth() + 1}`,
    dow: dows[d.getDay()],
  };
}

function initials(name: string): string {
  return name.split(" ").filter(Boolean).slice(-2).map((w) => w[0]?.toUpperCase()).join("");
}

/** 42 ô lịch cho tháng chứa `cursor` — hàng bắt đầu từ Thứ Hai. */
function monthCells(cursor: Date): Date[] {
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  // JS: CN=0..T7=6 → đổi về T2=0..CN=6
  const lead = (first.getDay() + 6) % 7;
  const start = new Date(first);
  start.setDate(first.getDate() - lead);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

// ── Screen ───────────────────────────────────────────────────────────────────

export default function AppointmentsScreen() {
  const isDark = useColorScheme() === "dark";
  const userId = useAuthStore((s) => s.session?.user.id ?? null);
  const { data: profile } = useMyProfile(userId);

  const todayISO = useMemo(() => toISODate(new Date()), []);
  const [selectedDate, setSelectedDate] = useState(todayISO);
  const [monthCursor, setMonthCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState<string | null>(null);
  const [justBookedId, setJustBooked] = useState<string | null>(null);

  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelCustom, setCancelCustom] = useState("");

  const advisorUser = profile?.advisor?.user ?? null;
  const advisorId = profile?.advisor?.user.id ?? "u-advisor-1";

  const {
    data: slots = [],
    isLoading: slotsLoading,
    refetch: refetchSlots,
    isRefetching: slotsRefetching,
  } = useAvailability(selectedDate);
  const {
    data: appointments = [],
    isLoading: apptsLoading,
    refetch: refetchAppts,
    isRefetching: apptsRefetching,
  } = useMyAppointments();

  const book = useBookAppointment();
  const cancel = useCancelAppointment();

  const upcoming = useMemo(
    () => appointments.filter((a) => a.status === "upcoming"),
    [appointments],
  );
  const history = useMemo(
    () => appointments.filter((a) => a.status !== "upcoming"),
    [appointments],
  );
  const upcomingDates = useMemo(() => new Set(upcoming.map((a) => a.date)), [upcoming]);

  const morning = useMemo(() => slots.filter((s) => s.start < "12:00"), [slots]);
  const afternoon = useMemo(() => slots.filter((s) => s.start >= "12:00"), [slots]);
  const freeCount = useMemo(() => slots.filter((s) => s.available).length, [slots]);

  const refreshing = slotsRefetching || apptsRefetching;
  const onRefresh = () => {
    refetchSlots();
    refetchAppts();
  };

  const pickDate = (iso: string) => {
    setSelectedDate(iso);
    setSelectedSlot(null);
    setJustBooked(null);
  };

  const shiftMonth = (delta: number) =>
    setMonthCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1));

  const confirmBooking = () => {
    if (!selectedSlot || !userId) return;
    const r = reason.trim();
    if (r.length < 10) {
      setReasonError("Viết rõ lý do buổi hẹn (ít nhất 10 ký tự) để advisor chuẩn bị tốt hơn.");
      return;
    }
    setReasonError(null);
    book.mutate(
      {
        student_id: userId,
        advisor_id: advisorId,
        date: selectedSlot.date,
        start_time: selectedSlot.start,
        end_time: selectedSlot.end,
        reason: r,
      },
      {
        onSuccess: (appt) => {
          setSelectedSlot(null);
          setReason("");
          setJustBooked(appt.id);
        },
      },
    );
  };

  const confirmCancel = () => {
    if (!cancelTarget) return;
    const r = (cancelCustom.trim() || cancelReason).trim();
    if (!r) return;
    cancel.mutate(
      { id: cancelTarget.id, reason: r },
      {
        onSuccess: () => {
          setCancelTarget(null);
          setCancelReason("");
          setCancelCustom("");
        },
      },
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-ground dark:bg-ground-dark" edges={["top"]}>
      <ScreenHeader
        title="Đặt lịch hẹn"
        subtitle={
          advisorUser
            ? `Với ${advisorUser.full_name} · ${profile?.advisor?.assignment.group_name ?? ""}`
            : "Gặp trực tiếp advisor của bạn"
        }
        onBack={goBack}
        right={
          upcoming.length > 0 ? (
            <View
              className="rounded-full px-3 py-1.5"
              style={{ backgroundColor: isDark ? "#2E1C0E" : "#FFF1E7" }}
            >
              <Text className="text-xs font-bold" style={{ color: isDark ? "#FFA371" : ORANGE_DEEP }}>
                {upcoming.length} sắp tới
              </Text>
            </View>
          ) : undefined
        }
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ORANGE} />
        }
      >
        {/* ── Advisor strip ── */}
        <View className="px-5 pt-4">
          <View className="flex-row items-center gap-3 rounded-3xl border border-line bg-surface p-4 dark:border-line-dark dark:bg-surface-dark">
            <View
              className="items-center justify-center rounded-full"
              style={{ width: 52, height: 52, backgroundColor: isDark ? "#2E1C0E" : "#FFE5D4" }}
            >
              <Text className="text-lg font-bold" style={{ color: isDark ? "#FFA371" : ORANGE_DEEP }}>
                {advisorUser ? initials(advisorUser.full_name) : "AD"}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-[15px] font-bold text-ink dark:text-ink-dark" numberOfLines={1}>
                {advisorUser?.full_name ?? "Advisor của bạn"}
              </Text>
              <Text className="mt-0.5 text-xs text-ink-muted dark:text-ink-muted-dark" numberOfLines={1}>
                {advisorUser?.email ?? "Liên hệ Phòng Đào tạo để được phân công"}
              </Text>
              <View className="mt-1.5 flex-row items-center gap-1">
                <MaterialCommunityIcons name="map-marker-outline" size={13} color={ORANGE} />
                <Text className="text-[11px] font-semibold text-ink-muted dark:text-ink-muted-dark">
                  Phòng 305 · Tòa Beta / Online
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Success banner ── */}
        {justBookedId && (
          <View className="px-5 pt-4">
            <View
              className="flex-row items-center gap-3 rounded-3xl p-4"
              style={{ backgroundColor: "#0F7A4D" }}
            >
              <View
                className="h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: "rgba(255,255,255,0.22)" }}
              >
                <MaterialCommunityIcons name="check" size={20} color="#fff" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-white">Đặt lịch thành công</Text>
                <Text className="mt-0.5 text-xs leading-4" style={{ color: "rgba(255,255,255,0.85)" }}>
                  Advisor sẽ xác nhận qua thông báo. Xem chi tiết ở danh sách bên dưới.
                </Text>
              </View>
              <Pressable onPress={() => setJustBooked(null)} hitSlop={10}>
                <MaterialCommunityIcons name="close" size={18} color="rgba(255,255,255,0.8)" />
              </Pressable>
            </View>
          </View>
        )}

        {/* ── Calendar card ── */}
        <View className="px-5 pt-4">
          <View className="rounded-3xl border border-line bg-surface p-4 dark:border-line-dark dark:bg-surface-dark">
            <View className="flex-row items-center justify-between">
              <Pressable
                onPress={() => shiftMonth(-1)}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="Tháng trước"
                className="h-11 w-11 items-center justify-center rounded-full active:opacity-60"
                style={{ backgroundColor: isDark ? "#241F1B" : "#F2EDE7" }}
              >
                <MaterialCommunityIcons
                  name="chevron-left"
                  size={22}
                  color={isDark ? "#FFA371" : ORANGE_DEEP}
                />
              </Pressable>
              <View className="items-center">
                <Text className="text-[16px] font-bold text-ink dark:text-ink-dark">
                  {MONTHS_VI[monthCursor.getMonth()]} {monthCursor.getFullYear()}
                </Text>
                <Text className="mt-0.5 text-[11px] text-ink-faint dark:text-ink-faint-dark">
                  {viLong(selectedDate)}
                </Text>
              </View>
              <Pressable
                onPress={() => shiftMonth(1)}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="Tháng sau"
                className="h-11 w-11 items-center justify-center rounded-full active:opacity-60"
                style={{ backgroundColor: isDark ? "#241F1B" : "#F2EDE7" }}
              >
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={22}
                  color={isDark ? "#FFA371" : ORANGE_DEEP}
                />
              </Pressable>
            </View>

            {/* weekday header */}
            <View className="mt-3 flex-row">
              {WEEKDAYS.map((w) => (
                <View key={w} className="flex-1 items-center py-1">
                  <Text className="text-[11px] font-bold text-ink-faint dark:text-ink-faint-dark">
                    {w}
                  </Text>
                </View>
              ))}
            </View>

            {/* day grid — 44px touch targets */}
            <View className="flex-row flex-wrap">
              {monthCells(monthCursor).map((d) => {
                const iso = toISODate(d);
                const inMonth = d.getMonth() === monthCursor.getMonth();
                const isSelected = iso === selectedDate;
                const isToday = iso === todayISO;
                const isPast = iso < todayISO;
                const isSunday = d.getDay() === 0;
                const disabled = isPast || isSunday;
                const hasAppt = upcomingDates.has(iso);
                return (
                  <View key={iso} style={{ width: "14.28%" }} className="items-center py-0.5">
                    <Pressable
                      onPress={() => !disabled && pickDate(iso)}
                      disabled={disabled}
                      accessibilityRole="button"
                      accessibilityLabel={`${d.getDate()}/${d.getMonth() + 1}`}
                      className="items-center justify-center rounded-full active:opacity-70"
                      style={{
                        width: 40,
                        height: 40,
                        backgroundColor: isSelected
                          ? ORANGE
                          : isToday
                            ? "transparent"
                            : "transparent",
                        borderWidth: isToday && !isSelected ? 1.5 : 0,
                        borderColor: ORANGE,
                        opacity: !inMonth ? 0.35 : disabled ? 0.4 : 1,
                      }}
                    >
                      <Text
                        className="text-sm font-semibold tabular-nums"
                        style={{
                          color: isSelected
                            ? "#fff"
                            : !inMonth
                              ? isDark
                                ? "#7D746C"
                                : "#B4A79C"
                              : disabled
                                ? isDark
                                  ? "#5A534B"
                                  : "#B4A79C"
                                : isDark
                                  ? "#F7F2EC"
                                  : "#191512",
                          fontWeight: isSelected || isToday ? "700" : "600",
                        }}
                      >
                        {d.getDate()}
                      </Text>
                      {hasAppt && !isSelected && (
                        <View
                          className="absolute rounded-full"
                          style={{
                            width: 5,
                            height: 5,
                            bottom: 6,
                            backgroundColor: ORANGE,
                          }}
                        />
                      )}
                      {isSelected && hasAppt && (
                        <View
                          className="absolute rounded-full bg-white"
                          style={{ width: 5, height: 5, bottom: 6 }}
                        />
                      )}
                    </Pressable>
                  </View>
                );
              })}
            </View>

            {/* legend */}
            <View className="mt-2 flex-row items-center gap-4 px-1">
              <View className="flex-row items-center gap-1.5">
                <View className="h-2 w-2 rounded-full" style={{ backgroundColor: ORANGE }} />
                <Text className="text-[11px] text-ink-muted dark:text-ink-muted-dark">Đã chọn</Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <View
                  className="h-2 w-2 rounded-full border"
                  style={{ borderColor: ORANGE }}
                />
                <Text className="text-[11px] text-ink-muted dark:text-ink-muted-dark">Hôm nay</Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <View className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: ORANGE }} />
                <Text className="text-[11px] text-ink-muted dark:text-ink-muted-dark">Có lịch hẹn</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Time slots ── */}
        <View className="px-5 pt-5">
          <View className="flex-row items-end justify-between">
            <Text className="text-[15px] font-bold text-ink dark:text-ink-dark">
              Khung giờ trống
            </Text>
            <Text className="text-xs font-semibold" style={{ color: ORANGE_DEEP }}>
              {slotsLoading ? "Đang tải…" : `${freeCount} khung còn trống`}
            </Text>
          </View>
          <Text className="mt-1 text-xs text-ink-muted dark:text-ink-muted-dark">
            Mỗi buổi 30 phút · Chạm để chọn giờ bạn muốn gặp
          </Text>

          {slotsLoading ? (
            <View className="mt-3 items-center rounded-3xl border border-line bg-surface py-10 dark:border-line-dark dark:bg-surface-dark">
              <ActivityIndicator color={ORANGE} />
              <Text className="mt-2 text-xs text-ink-muted dark:text-ink-muted-dark">
                Đang xem lịch rảnh của advisor…
              </Text>
            </View>
          ) : slots.length === 0 ? (
            <View className="mt-3 items-center rounded-3xl border border-line bg-surface px-6 py-8 dark:border-line-dark dark:bg-surface-dark">
              <View
                className="h-12 w-12 items-center justify-center rounded-full"
                style={{ backgroundColor: isDark ? "#241F1B" : "#F2EDE7" }}
              >
                <MaterialCommunityIcons
                  name="bed-outline"
                  size={22}
                  color={isDark ? "#FFA371" : ORANGE_DEEP}
                />
              </View>
              <Text className="mt-3 text-sm font-bold text-ink dark:text-ink-dark">
                Advisor nghỉ Chủ nhật
              </Text>
              <Text className="mt-1 text-center text-xs leading-4 text-ink-muted dark:text-ink-muted-dark">
                Chọn một ngày khác trong tuần để xem khung giờ trống.
              </Text>
            </View>
          ) : (
            <>
              <SlotGroup
                title="Buổi sáng"
                icon="weather-sunny"
                slots={morning}
                selectedId={selectedSlot?.id ?? null}
                onPick={(s) => setSelectedSlot(s)}
                isDark={isDark}
              />
              <SlotGroup
                title="Buổi chiều"
                icon="weather-partly-cloudy"
                slots={afternoon}
                selectedId={selectedSlot?.id ?? null}
                onPick={(s) => setSelectedSlot(s)}
                isDark={isDark}
              />
              {freeCount === 0 && (
                <View className="mt-3 rounded-2xl bg-brand-tint p-3.5 dark:bg-brand-tint-dark">
                  <Text className="text-center text-xs leading-4 text-ink-muted dark:text-ink-muted-dark">
                    Ngày này đã kín lịch. Thử ngày khác — chấm cam trên lịch là ngày bạn đã có hẹn.
                  </Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* ── Upcoming ── */}
        <View className="px-5 pt-6">
          <View className="flex-row items-end justify-between">
            <Text className="text-[15px] font-bold text-ink dark:text-ink-dark">
              Lịch hẹn sắp tới
            </Text>
            {upcoming.length > 0 && (
              <Text className="text-xs text-ink-faint dark:text-ink-faint-dark">
                {upcoming.length} buổi
              </Text>
            )}
          </View>

          {apptsLoading ? (
            <View className="mt-3 items-center rounded-3xl border border-line bg-surface py-10 dark:border-line-dark dark:bg-surface-dark">
              <ActivityIndicator color={ORANGE} />
            </View>
          ) : upcoming.length === 0 ? (
            <View className="mt-3 items-center rounded-3xl border border-dashed border-line bg-surface px-6 py-8 dark:border-line-dark dark:bg-surface-dark">
              <View
                className="h-12 w-12 items-center justify-center rounded-full"
                style={{ backgroundColor: ORANGE }}
              >
                <MaterialCommunityIcons name="calendar-plus" size={22} color="#fff" />
              </View>
              <Text className="mt-3 text-sm font-bold text-ink dark:text-ink-dark">
                Chưa có lịch hẹn nào
              </Text>
              <Text className="mt-1 text-center text-xs leading-4 text-ink-muted dark:text-ink-muted-dark">
                Chọn ngày và khung giờ ở trên để đặt buổi gặp đầu tiên với advisor.
              </Text>
            </View>
          ) : (
            <View className="mt-3 gap-3">
              {upcoming.map((a) => (
                <AppointmentCard
                  key={a.id}
                  appointment={a}
                  advisorName={advisorUser?.full_name ?? "Advisor"}
                  isDark={isDark}
                  highlight={a.id === justBookedId}
                  onCancel={() => setCancelTarget(a)}
                />
              ))}
            </View>
          )}

          {history.length > 0 && (
            <View className="mt-5">
              <Text className="text-[13px] font-bold text-ink-muted dark:text-ink-muted-dark">
                Đã qua / đã hủy ({history.length})
              </Text>
              <View className="mt-2 gap-2 opacity-80">
                {history.map((a) => (
                  <View
                    key={a.id}
                    className="flex-row items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 dark:border-line-dark dark:bg-surface-dark"
                  >
                    <Text className="text-xs font-bold text-ink-faint dark:text-ink-faint-dark tabular-nums">
                      {viShort(a.date).day}/{viShort(a.date).mon}
                    </Text>
                    <Text className="flex-1 text-xs text-ink-muted dark:text-ink-muted-dark" numberOfLines={1}>
                      {a.start_time} · {a.reason}
                    </Text>
                    <Text
                      className="text-[11px] font-bold"
                      style={{ color: a.status === "cancelled" ? "#C2410C" : "#6A6058" }}
                    >
                      {a.status === "cancelled" ? "Đã hủy" : "Hoàn thành"}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* ── Booking sheet ── */}
      <Sheet open={!!selectedSlot} onClose={() => setSelectedSlot(null)}>
        {selectedSlot && (
          <View>
            <View className="flex-row items-center gap-3">
              <View
                className="h-12 w-12 items-center justify-center rounded-2xl"
                style={{ backgroundColor: ORANGE }}
              >
                <MaterialCommunityIcons name="calendar-clock" size={22} color="#fff" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-ink dark:text-ink-dark">
                  Xác nhận đặt lịch
                </Text>
                <Text className="mt-0.5 text-xs text-ink-muted dark:text-ink-muted-dark">
                  {viLong(selectedSlot.date)} · {selectedSlot.start}–{selectedSlot.end}
                </Text>
              </View>
            </View>

            <View
              className="mt-4 flex-row items-center gap-3 rounded-2xl p-3"
              style={{ backgroundColor: isDark ? "#241F1B" : "#FFF1E7" }}
            >
              <View
                className="h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: isDark ? "#2E1C0E" : "#FFE5D4" }}
              >
                <Text className="text-sm font-bold" style={{ color: isDark ? "#FFA371" : ORANGE_DEEP }}>
                  {advisorUser ? initials(advisorUser.full_name) : "AD"}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-ink dark:text-ink-dark" numberOfLines={1}>
                  {advisorUser?.full_name ?? "Advisor của bạn"}
                </Text>
                <Text className="text-[11px] text-ink-muted dark:text-ink-muted-dark">
                  30 phút · Phòng 305 Tòa Beta / Online
                </Text>
              </View>
              <View className="rounded-full px-2.5 py-1" style={{ backgroundColor: ORANGE }}>
                <Text className="text-[11px] font-bold text-white tabular-nums">
                  {selectedSlot.start}
                </Text>
              </View>
            </View>

            <Text className="mb-1.5 mt-4 text-sm font-bold text-ink dark:text-ink-dark">
              Lý do buổi hẹn <Text style={{ color: ORANGE }}>*</Text>
            </Text>
            <View className="mb-2 flex-row flex-wrap gap-2">
              {QUICK_REASONS.map((q) => (
                <Pressable
                  key={q}
                  onPress={() => {
                    setReason((prev) => (prev ? prev : q));
                    setReasonError(null);
                  }}
                  className="rounded-full border px-3 py-2 active:opacity-70"
                  style={{
                    borderColor: isDark ? "#302A24" : "#EAE1D8",
                    backgroundColor: isDark ? "#1B1815" : "#fff",
                  }}
                >
                  <Text className="text-xs font-semibold text-ink-muted dark:text-ink-muted-dark">
                    {q}
                  </Text>
                </Pressable>
              ))}
            </View>
            <TextInput
              value={reason}
              onChangeText={(t) => {
                setReason(t);
                if (reasonError) setReasonError(null);
              }}
              placeholder="Ví dụ: Em muốn tư vấn chọn môn kỳ tới phù hợp với GPA 7.4 và định hướng AI…"
              placeholderTextColor={isDark ? "#7D746C" : "#8B8178"}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              className="min-h-[110px] rounded-2xl border px-4 py-3 text-sm leading-5 text-ink dark:text-ink-dark"
              style={{
                borderColor: reasonError ? "#DC2626" : isDark ? "#302A24" : "#EAE1D8",
                backgroundColor: isDark ? "#12100E" : "#FAF7F4",
              }}
            />
            {reasonError ? (
              <Text className="mt-1.5 text-xs font-semibold" style={{ color: "#DC2626" }}>
                {reasonError}
              </Text>
            ) : (
              <Text className="mt-1.5 text-[11px] text-ink-faint dark:text-ink-faint-dark">
                {reason.trim().length}/500 ký tự · càng cụ thể, advisor chuẩn bị càng tốt
              </Text>
            )}

            <Pressable
              onPress={confirmBooking}
              disabled={book.isPending}
              accessibilityRole="button"
              accessibilityLabel="Xác nhận đặt lịch"
              className="mt-4 flex-row items-center justify-center gap-2 rounded-2xl py-4 active:opacity-85"
              style={{ backgroundColor: ORANGE, opacity: book.isPending ? 0.7 : 1 }}
            >
              {book.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <MaterialCommunityIcons name="check-circle-outline" size={19} color="#fff" />
                  <Text className="text-[15px] font-bold text-white">Xác nhận đặt lịch</Text>
                </>
              )}
            </Pressable>
            {book.isError && (
              <Text className="mt-2 text-center text-xs font-semibold" style={{ color: "#DC2626" }}>
                Đặt lịch thất bại, thử lại giúp bạn nhé.
              </Text>
            )}
            <Pressable onPress={() => setSelectedSlot(null)} className="mt-1 items-center py-3" hitSlop={10}>
              <Text className="text-sm font-semibold text-ink-muted dark:text-ink-muted-dark">
                Chọn khung giờ khác
              </Text>
            </Pressable>
          </View>
        )}
      </Sheet>

      {/* ── Cancel sheet ── */}
      <Sheet open={!!cancelTarget} onClose={() => setCancelTarget(null)}>
        {cancelTarget && (
          <View>
            <View className="flex-row items-center gap-3">
              <View
                className="h-12 w-12 items-center justify-center rounded-2xl"
                style={{ backgroundColor: "#FEF2F2", borderWidth: 1, borderColor: "#FECACA" }}
              >
                <MaterialCommunityIcons name="calendar-remove-outline" size={22} color="#DC2626" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-ink dark:text-ink-dark">Hủy lịch hẹn?</Text>
                <Text className="mt-0.5 text-xs text-ink-muted dark:text-ink-muted-dark">
                  {viLong(cancelTarget.date)} · {cancelTarget.start_time}–{cancelTarget.end_time}
                </Text>
              </View>
            </View>

            <Text className="mb-2 mt-4 text-sm font-bold text-ink dark:text-ink-dark">
              Cho advisor biết lý do <Text style={{ color: "#DC2626" }}>*</Text>
            </Text>
            <View className="gap-2">
              {CANCEL_REASONS.map((r) => {
                const active = cancelReason === r && !cancelCustom.trim();
                return (
                  <Pressable
                    key={r}
                    onPress={() => {
                      setCancelReason(r);
                      setCancelCustom("");
                    }}
                    className="flex-row items-center gap-3 rounded-2xl border px-4 py-3.5 active:opacity-70"
                    style={{
                      borderColor: active ? "#DC2626" : isDark ? "#302A24" : "#EAE1D8",
                      backgroundColor: active
                        ? isDark
                          ? "#2A1512"
                          : "#FEF2F2"
                        : isDark
                          ? "#1B1815"
                          : "#fff",
                    }}
                  >
                    <View
                      className="h-5 w-5 items-center justify-center rounded-full border-2"
                      style={{ borderColor: active ? "#DC2626" : isDark ? "#4A423B" : "#C3B8AD" }}
                    >
                      {active && (
                        <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#DC2626" }} />
                      )}
                    </View>
                    <Text
                      className="flex-1 text-sm"
                      style={{
                        color: active ? (isDark ? "#FCA5A5" : "#991B1B") : isDark ? "#F7F2EC" : "#191512",
                        fontWeight: active ? "700" : "500",
                      }}
                    >
                      {r}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <TextInput
              value={cancelCustom}
              onChangeText={setCancelCustom}
              placeholder="Hoặc viết lý do khác…"
              placeholderTextColor={isDark ? "#7D746C" : "#8B8178"}
              className="mt-2 rounded-2xl border px-4 py-3 text-sm text-ink dark:text-ink-dark"
              style={{
                borderColor: isDark ? "#302A24" : "#EAE1D8",
                backgroundColor: isDark ? "#12100E" : "#FAF7F4",
              }}
            />

            <View className="mt-4 flex-row gap-2.5">
              <Pressable
                onPress={() => setCancelTarget(null)}
                className="flex-1 items-center justify-center rounded-2xl border py-4 active:opacity-70"
                style={{ borderColor: isDark ? "#302A24" : "#EAE1D8" }}
              >
                <Text className="text-[15px] font-bold text-ink-muted dark:text-ink-muted-dark">
                  Giữ lịch
                </Text>
              </Pressable>
              <Pressable
                onPress={confirmCancel}
                disabled={!(cancelReason || cancelCustom.trim()) || cancel.isPending}
                className="flex-[1.4] items-center justify-center rounded-2xl py-4 active:opacity-85"
                style={{
                  backgroundColor: "#DC2626",
                  opacity: !(cancelReason || cancelCustom.trim()) || cancel.isPending ? 0.45 : 1,
                }}
              >
                {cancel.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-[15px] font-bold text-white">Xác nhận hủy</Text>
                )}
              </Pressable>
            </View>
          </View>
        )}
      </Sheet>
    </SafeAreaView>
  );
}

// ── Pieces ───────────────────────────────────────────────────────────────────

function SlotGroup({
  title,
  icon,
  slots,
  selectedId,
  onPick,
  isDark,
}: {
  title: string;
  icon: string;
  slots: TimeSlot[];
  selectedId: string | null;
  onPick: (s: TimeSlot) => void;
  isDark: boolean;
}) {
  if (slots.length === 0) return null;
  return (
    <View className="mt-3">
      <View className="mb-2 flex-row items-center gap-1.5">
        <MaterialCommunityIcons name={icon as never} size={15} color={ORANGE} />
        <Text className="text-[13px] font-bold text-ink-muted dark:text-ink-muted-dark">
          {title} ({slots.filter((s) => s.available).length}/{slots.length} trống)
        </Text>
      </View>
      <View className="flex-row flex-wrap" style={{ gap: 10 }}>
        {slots.map((s) => {
          const selected = s.id === selectedId;
          return (
            <Pressable
              key={s.id}
              onPress={() => s.available && onPick(s)}
              disabled={!s.available}
              accessibilityRole="button"
              accessibilityLabel={`${s.start} đến ${s.end}${s.available ? "" : ", đã kín"}`}
              className="items-center justify-center rounded-2xl py-3.5 active:opacity-70"
              style={{
                width: "31%",
                backgroundColor: selected
                  ? ORANGE
                  : s.available
                    ? isDark
                      ? "#1B1815"
                      : "#fff"
                    : isDark
                      ? "#1B1815"
                      : "#F2EDE7",
                borderWidth: 1.5,
                borderColor: selected ? ORANGE : s.available ? (isDark ? "#3A2A1C" : "#FFD9BE") : "transparent",
                opacity: s.available ? 1 : 0.55,
              }}
            >
              <Text
                className="text-[15px] font-bold tabular-nums"
                style={{
                  color: selected ? "#fff" : s.available ? (isDark ? "#F7F2EC" : "#191512") : isDark ? "#5A534B" : "#A89C90",
                  textDecorationLine: s.available ? "none" : "line-through",
                }}
              >
                {s.start}
              </Text>
              <Text
                className="mt-0.5 text-[10px] font-semibold"
                style={{ color: selected ? "rgba(255,255,255,0.85)" : isDark ? "#7D746C" : "#8B8178" }}
              >
                {s.available ? "Còn trống" : "Đã kín"}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function AppointmentCard({
  appointment,
  advisorName,
  isDark,
  highlight,
  onCancel,
}: {
  appointment: Appointment;
  advisorName: string;
  isDark: boolean;
  highlight: boolean;
  onCancel: () => void;
}) {
  const v = viShort(appointment.date);
  return (
    <View
      className="overflow-hidden rounded-3xl border bg-surface dark:bg-surface-dark"
      style={{
        borderColor: highlight ? ORANGE : isDark ? "#302A24" : "#EAE1D8",
        borderWidth: highlight ? 2 : 1,
      }}
    >
      {/* date band */}
      <View
        className="flex-row items-center gap-3 px-4 py-3"
        style={{ backgroundColor: isDark ? "#241F1B" : "#FFF6EE" }}
      >
        <View
          className="items-center justify-center rounded-2xl px-3 py-1.5"
          style={{ backgroundColor: ORANGE, minWidth: 58 }}
        >
          <Text className="text-lg font-bold leading-5 text-white tabular-nums">{v.day}</Text>
          <Text className="text-[10px] font-bold text-white">
            {v.mon} · {v.dow}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-[15px] font-bold text-ink tabular-nums dark:text-ink-dark">
            {appointment.start_time} – {appointment.end_time}
          </Text>
          <Text className="mt-0.5 text-[11px] text-ink-muted dark:text-ink-muted-dark" numberOfLines={1}>
            {advisorName} · {appointment.location}
          </Text>
        </View>
        {highlight && (
          <View className="rounded-full px-2.5 py-1" style={{ backgroundColor: ORANGE }}>
            <Text className="text-[10px] font-bold text-white">MỚI</Text>
          </View>
        )}
      </View>
      <View className="px-4 py-3">
        <View className="flex-row gap-2">
          <MaterialCommunityIcons
            name="message-text-outline"
            size={15}
            color={isDark ? "#FFA371" : ORANGE_DEEP}
            style={{ marginTop: 2 }}
          />
          <Text className="flex-1 text-[13px] leading-5 text-ink dark:text-ink-dark">
            {appointment.reason}
          </Text>
        </View>
        <View className="mt-3 flex-row gap-2.5">
          <View
            className="flex-1 flex-row items-center justify-center gap-1.5 rounded-2xl py-3"
            style={{ backgroundColor: isDark ? "#241F1B" : "#F2EDE7" }}
          >
            <MaterialCommunityIcons name="video-outline" size={16} color={isDark ? "#FFA371" : ORANGE_DEEP} />
            <Text className="text-xs font-bold" style={{ color: isDark ? "#FFA371" : ORANGE_DEEP }}>
              {appointment.location.includes("Online") ? "Meet online" : "Gặp trực tiếp"}
            </Text>
          </View>
          <Pressable
            onPress={onCancel}
            accessibilityRole="button"
            accessibilityLabel="Hủy lịch hẹn"
            className="flex-1 items-center justify-center rounded-2xl border py-3 active:opacity-70"
            style={{ borderColor: "#FECACA", backgroundColor: isDark ? "#2A1512" : "#fff" }}
          >
            <Text className="text-xs font-bold" style={{ color: "#DC2626" }}>
              Hủy lịch
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
