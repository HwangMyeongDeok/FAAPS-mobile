/**
 * FE-S — Appointment booking: schedule a 1-on-1 session with your advisor.
 *
 * One screen answers one question: "When can I meet my advisor?"
 * Booking lives at the top (month calendar + 30-minute slots + reason sheet),
 * upcoming sessions below with a cancel action — one vertical scroll, every
 * action within thumb reach.
 *
 * Data comes from:
 *   • `GET  /api/appointments/available-slots?date=&advisorId=`
 *   • `GET  /api/student/appointments`
 *   • `POST /api/student/appointments`
 *   • `PUT  /api/appointments/{id}/cancel`
 */

import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { useMyAdvisor } from "@/lib/queries/profile";
import {
  useAvailability,
  useBookAppointment,
  useCancelAppointment,
  useMyAppointments,
} from "@/lib/queries/appointments";
import type { AvailableSlot, BookedAppointment } from "@/types";

const ORANGE = "#F36F21";
const ORANGE_DEEP = "#B5460D";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const QUICK_REASONS = [
  "Study plan advice",
  "Choosing a specialization",
  "Registering for next semester",
  "Improving my GPA / retaking a course",
  "Internship & career direction",
];

const CANCEL_REASONS = [
  "Unexpected class conflict",
  "Already discussed over messages",
  "I want a different time slot",
  "Personal reason",
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

function longDate(dateStr: string): string {
  const d = parseISO(dateStr);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function shortDate(dateStr: string): { day: string; mon: string; dow: string } {
  const d = parseISO(dateStr);
  const dows = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  return {
    day: `${d.getDate()}`.padStart(2, "0"),
    mon: MONTHS[d.getMonth()].slice(0, 3),
    dow: dows[d.getDay()],
  };
}

/** Extract the time part of an ISO local date-time ("2026-11-12T09:00:00"). */
function timeOf(iso: string): string {
  const match = /T(\d{2}:\d{2})/.exec(iso);
  return match ? match[1] : iso;
}

/** Extract the date part of an ISO local date-time. */
function dateOf(iso: string): string {
  return iso.split("T")[0];
}

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

/** 42 calendar cells for the month containing `cursor` — the week starts on Monday. */
function monthCells(cursor: Date): Date[] {
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  // JS: Sun=0..Sat=6 → shift so Mon=0..Sun=6
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
  const {
    data: advisor,
    isLoading: advisorLoading,
    isError: advisorError,
    refetch: refetchAdvisor,
  } = useMyAdvisor();

  const todayISO = useMemo(() => toISODate(new Date()), []);
  const [selectedDate, setSelectedDate] = useState(todayISO);
  const [monthCursor, setMonthCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState<string | null>(null);
  const [justBookedId, setJustBooked] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [cancelTarget, setCancelTarget] = useState<BookedAppointment | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelCustom, setCancelCustom] = useState("");

  const advisorId = advisor?.id;

  /**
   * True only when the advisor really is absent — the request succeeded and
   * the student has none. While the request is still running (or failed) the
   * advisor is simply unknown, which is a different thing.
   */
  const hasNoAdvisor = !advisorLoading && !advisorError && !advisor;

  // The toast clears itself — the user should never have to dismiss it.
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const {
    data: slots = [],
    isLoading: slotsLoading,
    isError: slotsError,
    refetch: refetchSlots,
    isRefetching: slotsRefetching,
  } = useAvailability(selectedDate, advisorId, !hasNoAdvisor && !advisorError);
  const {
    data: appointments = [],
    isLoading: apptsLoading,
    refetch: refetchAppts,
    isRefetching: apptsRefetching,
  } = useMyAppointments();

  const book = useBookAppointment();
  const cancel = useCancelAppointment();

  const upcoming = useMemo(
    () => appointments.filter((a) => a.status === "PENDING" || a.status === "ACCEPTED" || a.status === "SCHEDULED"),
    [appointments],
  );
  const history = useMemo(
    () => appointments.filter((a) => a.status !== "PENDING" && a.status !== "ACCEPTED" && a.status !== "SCHEDULED"),
    [appointments],
  );
  const upcomingDates = useMemo(
    () => new Set(upcoming.map((a) => dateOf(a.startTime))),
    [upcoming],
  );

  const morning = useMemo(
    () => slots.filter((s) => timeOf(s.startTime) < "12:00"),
    [slots],
  );
  const afternoon = useMemo(
    () => slots.filter((s) => timeOf(s.startTime) >= "12:00"),
    [slots],
  );

  const refreshing = slotsRefetching || apptsRefetching;
  const onRefresh = () => {
    refetchAdvisor();
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
    if (!selectedSlot) return;

    // Booking without an advisor would fail on the server anyway, so it
    // never reaches the API. The student is told who to contact instead.
    if (!advisorId) {
      // The booking sheet is a modal, so an in-screen toast would be hidden
      // behind it — an alert always reaches the student.
      Alert.alert(
        "No advisor assigned",
        "You don't have an assigned advisor yet. Please contact the admin.",
      );
      setToast(
        "You don't have an assigned advisor yet. Please contact the admin.",
      );
      return;
    }

    const r = reason.trim();
    if (r.length < 10) {
      setReasonError(
        "Describe the reason for the session (at least 10 characters) so your advisor can prepare.",
      );
      return;
    }
    setReasonError(null);
    book.mutate(
      {
        advisorId,
        startTime: selectedSlot.startTime,
        reason: r,
      },
      {
        onSuccess: (appt) => {
          setSelectedSlot(null);
          setReason("");
          setJustBooked(appt.id);
        },
        onError: (error) => {
          setToast(
            error instanceof Error && error.message
              ? error.message
              : "The booking failed. Please try again.",
          );
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
        title="Book a session"
        subtitle={
          advisor
            ? `With ${advisor.fullName}${advisor.groupName ? ` · ${advisor.groupName}` : ""}`
            : "Meet your advisor in person"
        }
        onBack={goBack}
        right={
          upcoming.length > 0 ? (
            <View
              className="rounded-full px-3 py-1.5"
              style={{ backgroundColor: isDark ? "#2E1C0E" : "#FFF1E7" }}
            >
              <Text
                className="text-xs font-bold"
                style={{ color: isDark ? "#FFA371" : ORANGE_DEEP }}
              >
                {upcoming.length} upcoming
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
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={ORANGE}
          />
        }
      >
        {/* ── Advisor strip ── */}
        <View className="px-5 pt-4">
          {advisorError ? (
            // The advisor could not be loaded — that is a network/server
            // failure, so the student gets a retry instead of a silent
            // "no advisor" state.
            <View className="flex-row items-center gap-3 rounded-3xl border border-line bg-surface p-4 dark:border-line-dark dark:bg-surface-dark">
              <MaterialCommunityIcons
                name="cloud-off-outline"
                size={26}
                color="#94A3B8"
              />
              <View className="flex-1">
                <Text className="text-[15px] font-bold text-ink dark:text-ink-dark">
                  Could not load your advisor
                </Text>
                <Text className="mt-0.5 text-xs text-ink-muted dark:text-ink-muted-dark">
                  Check your connection and try again.
                </Text>
              </View>
              <Pressable
                onPress={() => refetchAdvisor()}
                hitSlop={8}
                className="rounded-full px-3 py-1.5"
                style={{ backgroundColor: isDark ? "#2E1C0E" : "#FFF1E7" }}
              >
                <Text
                  className="text-xs font-bold"
                  style={{ color: isDark ? "#FFA371" : ORANGE_DEEP }}
                >
                  Try again
                </Text>
              </Pressable>
            </View>
          ) : advisorLoading ? (
            <View className="flex-row items-center gap-3 rounded-3xl border border-line bg-surface p-4 dark:border-line-dark dark:bg-surface-dark">
              <ActivityIndicator color={ORANGE} />
              <Text className="text-sm text-ink-muted dark:text-ink-muted-dark">
                Loading your advisor…
              </Text>
            </View>
          ) : (
            <View className="flex-row items-center gap-3 rounded-3xl border border-line bg-surface p-4 dark:border-line-dark dark:bg-surface-dark">
              <View
                className="items-center justify-center rounded-full"
                style={{
                  width: 52,
                  height: 52,
                  backgroundColor: isDark ? "#2E1C0E" : "#FFE5D4",
                }}
              >
                <Text
                  className="text-lg font-bold"
                  style={{ color: isDark ? "#FFA371" : ORANGE_DEEP }}
                >
                  {advisor ? initials(advisor.fullName) : "AD"}
                </Text>
              </View>
              <View className="flex-1">
                <Text
                  className="text-[15px] font-bold text-ink dark:text-ink-dark"
                  numberOfLines={1}
                >
                  {advisor?.fullName ?? "Your advisor"}
                </Text>
                <Text
                  className="mt-0.5 text-xs text-ink-muted dark:text-ink-muted-dark"
                  numberOfLines={1}
                >
                  {advisor?.email ?? "Contact the Academic Office to get an advisor"}
                </Text>
                {advisor?.specialization ? (
                  <View className="mt-1.5 flex-row items-center gap-1">
                    <MaterialCommunityIcons
                      name="briefcase-outline"
                      size={13}
                      color={ORANGE}
                    />
                    <Text className="text-[11px] font-semibold text-ink-muted dark:text-ink-muted-dark">
                      {advisor.specialization}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          )}

          {/* No advisor yet — booking is blocked, so say it up front. */}
          {hasNoAdvisor ? (
            <View
              className="mt-3 flex-row items-start gap-2.5 rounded-2xl px-3.5 py-3"
              style={{ backgroundColor: isDark ? "#3A2A10" : "#FFF4E6" }}
            >
              <MaterialCommunityIcons
                name="account-alert-outline"
                size={18}
                color={ORANGE}
              />
              <Text
                className="flex-1 text-xs leading-4"
                style={{ color: isDark ? "#FFD9B8" : "#8A4B12" }}
              >
                You don&apos;t have an assigned advisor yet. Please contact the
                admin.
              </Text>
            </View>
          ) : null}
        </View>

        {/* ── Success banner ── */}
        {justBookedId ? (
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
                <Text className="text-sm font-bold text-white">
                  Session booked
                </Text>
                <Text
                  className="mt-0.5 text-xs leading-4"
                  style={{ color: "rgba(255,255,255,0.85)" }}
                >
                  Your advisor will confirm by notification. The details are in
                  the list below.
                </Text>
              </View>
              <Pressable onPress={() => setJustBooked(null)} hitSlop={10}>
                <MaterialCommunityIcons
                  name="close"
                  size={18}
                  color="rgba(255,255,255,0.8)"
                />
              </Pressable>
            </View>
          </View>
        ) : null}

        {/* ── Calendar card ── */}
        <View className="px-5 pt-4">
          <View className="rounded-3xl border border-line bg-surface p-4 dark:border-line-dark dark:bg-surface-dark">
            <View className="flex-row items-center justify-between">
              <Pressable
                onPress={() => shiftMonth(-1)}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="Previous month"
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
                  {MONTHS[monthCursor.getMonth()]} {monthCursor.getFullYear()}
                </Text>
                <Text className="mt-0.5 text-[11px] text-ink-faint dark:text-ink-faint-dark">
                  {longDate(selectedDate)}
                </Text>
              </View>
              <Pressable
                onPress={() => shiftMonth(1)}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="Next month"
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

            {/* day grid — 40px touch targets */}
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
                  <View
                    key={iso}
                    style={{ width: "14.28%" }}
                    className="items-center py-0.5"
                  >
                    <Pressable
                      onPress={() => !disabled && pickDate(iso)}
                      disabled={disabled}
                      accessibilityRole="button"
                      accessibilityLabel={`${d.getDate()}/${d.getMonth() + 1}`}
                      className="items-center justify-center rounded-full active:opacity-70"
                      style={{
                        width: 40,
                        height: 40,
                        backgroundColor: isSelected ? ORANGE : "transparent",
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
                <View
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: ORANGE }}
                />
                <Text className="text-[11px] text-ink-muted dark:text-ink-muted-dark">
                  Selected
                </Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <View
                  className="h-2 w-2 rounded-full border"
                  style={{ borderColor: ORANGE }}
                />
                <Text className="text-[11px] text-ink-muted dark:text-ink-muted-dark">
                  Today
                </Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <View
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: ORANGE }}
                />
                <Text className="text-[11px] text-ink-muted dark:text-ink-muted-dark">
                  Has a session
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Time slots ── */}
        <View className="px-5 pt-5">
          <View className="flex-row items-end justify-between">
            <Text className="text-[15px] font-bold text-ink dark:text-ink-dark">
              Free slots
            </Text>
            <Text className="text-xs font-semibold" style={{ color: ORANGE_DEEP }}>
              {advisorLoading || slotsLoading
                ? "Loading…"
                : advisorError
                  ? "Unavailable"
                  : hasNoAdvisor
                    ? "Unavailable"
                    : `${slots.length} slots open`}
            </Text>
          </View>
          <Text className="mt-1 text-xs text-ink-muted dark:text-ink-muted-dark">
            Every session lasts 30 minutes · tap a time to pick it
          </Text>

          {advisorLoading ? (
            <View className="mt-3 items-center rounded-3xl border border-line bg-surface py-10 dark:border-line-dark dark:bg-surface-dark">
              <ActivityIndicator color={ORANGE} />
              <Text className="mt-2 text-xs text-ink-muted dark:text-ink-muted-dark">
                Checking your advisor&rsquo;s availability…
              </Text>
            </View>
          ) : advisorError ? (
            // The advisor could not be loaded, so the availability cannot be
            // fetched either. Offer a retry instead of an empty slot list.
            <View className="mt-3 items-center rounded-3xl border border-line bg-surface py-10 dark:border-line-dark dark:bg-surface-dark">
              <MaterialCommunityIcons
                name="cloud-off-outline"
                size={32}
                color="#94A3B8"
              />
              <Text className="mt-2 text-xs text-ink-muted dark:text-ink-muted-dark">
                Could not load the availability for this day.
              </Text>
              <Pressable
                onPress={() => refetchAdvisor()}
                hitSlop={8}
                className="mt-3 rounded-full px-4 py-2 active:opacity-80"
                style={{ backgroundColor: ORANGE }}
              >
                <Text className="text-xs font-bold text-white">Try again</Text>
              </Pressable>
            </View>
          ) : slotsLoading ? (
            <View className="mt-3 items-center rounded-3xl border border-line bg-surface py-10 dark:border-line-dark dark:bg-surface-dark">
              <ActivityIndicator color={ORANGE} />
              <Text className="mt-2 text-xs text-ink-muted dark:text-ink-muted-dark">
                Checking your advisor&rsquo;s availability…
              </Text>
            </View>
          ) : slotsError ? (
            <View className="mt-3 items-center rounded-3xl border border-line bg-surface py-10 dark:border-line-dark dark:bg-surface-dark">
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={32}
                color="#EF4444"
              />
              <Text className="mt-2 text-xs text-ink-muted dark:text-ink-muted-dark">
                Could not load the availability for this day.
              </Text>
              <Pressable
                onPress={() => refetchSlots()}
                hitSlop={8}
                className="mt-3 rounded-full px-4 py-2 active:opacity-80"
                style={{ backgroundColor: ORANGE }}
              >
                <Text className="text-xs font-bold text-white">Try again</Text>
              </Pressable>
            </View>
          ) : hasNoAdvisor ? (
            // Booking needs an advisor, so there is nothing to show yet.
            <View className="mt-3 items-center rounded-3xl border border-line bg-surface px-6 py-8 dark:border-line-dark dark:bg-surface-dark">
              <View
                className="h-12 w-12 items-center justify-center rounded-full"
                style={{ backgroundColor: isDark ? "#241F1B" : "#F2EDE7" }}
              >
                <MaterialCommunityIcons
                  name="account-alert-outline"
                  size={24}
                  color={isDark ? "#FFA371" : ORANGE_DEEP}
                />
              </View>
              <Text className="mt-3 text-sm font-bold text-ink dark:text-ink-dark">
                No advisor assigned yet
              </Text>
              <Text className="mt-1 text-center text-xs leading-4 text-ink-muted dark:text-ink-muted-dark">
                You don&apos;t have an assigned advisor yet. Please contact the
                admin.
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
                No free slots on this day
              </Text>
              <Text className="mt-1 text-center text-xs leading-4 text-ink-muted dark:text-ink-muted-dark">
                Pick another weekday to see the open slots.
              </Text>
            </View>
          ) : (
            <>
              <SlotGroup
                title="Morning"
                icon="weather-sunny"
                slots={morning}
                selectedStart={selectedSlot?.startTime ?? null}
                onPick={(s) => setSelectedSlot(s)}
                isDark={isDark}
              />
              <SlotGroup
                title="Afternoon"
                icon="weather-partly-cloudy"
                slots={afternoon}
                selectedStart={selectedSlot?.startTime ?? null}
                onPick={(s) => setSelectedSlot(s)}
                isDark={isDark}
              />
            </>
          )}
        </View>

        {/* ── Upcoming ── */}
        <View className="px-5 pt-6">
          <View className="flex-row items-end justify-between">
            <Text className="text-[15px] font-bold text-ink dark:text-ink-dark">
              Upcoming sessions
            </Text>
            {upcoming.length > 0 && (
              <Text className="text-xs text-ink-faint dark:text-ink-faint-dark">
                {upcoming.length} booked
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
                <MaterialCommunityIcons
                  name="calendar-plus"
                  size={22}
                  color="#fff"
                />
              </View>
              <Text className="mt-3 text-sm font-bold text-ink dark:text-ink-dark">
                No sessions booked
              </Text>
              <Text className="mt-1 text-center text-xs leading-4 text-ink-muted dark:text-ink-muted-dark">
                Pick a date and a time slot above to book your first session
                with your advisor.
              </Text>
            </View>
          ) : (
            <View className="mt-3 gap-3">
              {upcoming.map((a) => (
                <AppointmentCard
                  key={a.id}
                  appointment={a}
                  advisorName={advisor?.fullName ?? "Advisor"}
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
                Past / cancelled ({history.length})
              </Text>
              <View className="mt-2 gap-2 opacity-80">
                {history.map((a) => {
                  const v = shortDate(dateOf(a.startTime));
                  return (
                    <View
                      key={a.id}
                      className="flex-row items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 dark:border-line-dark dark:bg-surface-dark"
                    >
                      <Text className="text-xs font-bold text-ink-faint dark:text-ink-faint-dark tabular-nums">
                        {v.day}/{v.mon}
                      </Text>
                      <Text
                        className="flex-1 text-xs text-ink-muted dark:text-ink-muted-dark"
                        numberOfLines={1}
                      >
                        {timeOf(a.startTime)} · {a.reason}
                      </Text>
                      <Text
                        className="text-[11px] font-bold"
                        style={{
                          color: a.status === "CANCELLED" ? "#C2410C" : "#6A6058",
                        }}
                      >
                        {a.status === "CANCELLED" ? "Cancelled" : "Completed"}
                      </Text>
                    </View>
                  );
                })}
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
                <MaterialCommunityIcons
                  name="calendar-clock"
                  size={22}
                  color="#fff"
                />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-ink dark:text-ink-dark">
                  Confirm the booking
                </Text>
                <Text className="mt-0.5 text-xs text-ink-muted dark:text-ink-muted-dark">
                  {longDate(dateOf(selectedSlot.startTime))} ·{" "}
                  {timeOf(selectedSlot.startTime)}–{timeOf(selectedSlot.endTime)}
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
                <Text
                  className="text-sm font-bold"
                  style={{ color: isDark ? "#FFA371" : ORANGE_DEEP }}
                >
                  {advisor ? initials(advisor.fullName) : "AD"}
                </Text>
              </View>
              <View className="flex-1">
                <Text
                  className="text-sm font-bold text-ink dark:text-ink-dark"
                  numberOfLines={1}
                >
                  {advisor?.fullName ?? "Your advisor"}
                </Text>
                <Text className="text-[11px] text-ink-muted dark:text-ink-muted-dark">
                  30 minutes · in person or online
                </Text>
              </View>
              <View
                className="rounded-full px-2.5 py-1"
                style={{ backgroundColor: ORANGE }}
              >
                <Text className="text-[11px] font-bold text-white tabular-nums">
                  {timeOf(selectedSlot.startTime)}
                </Text>
              </View>
            </View>

            <Text className="mb-1.5 mt-4 text-sm font-bold text-ink dark:text-ink-dark">
              Reason for the session <Text style={{ color: ORANGE }}>*</Text>
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
              placeholder="e.g. I want advice on which courses to take next semester given my current GPA and the AI track…"
              placeholderTextColor={isDark ? "#7D746C" : "#8B8178"}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              className="min-h-[110px] rounded-2xl border px-4 py-3 text-sm leading-5 text-ink dark:text-ink-dark"
              style={{
                borderColor: reasonError
                  ? "#DC2626"
                  : isDark
                    ? "#302A24"
                    : "#EAE1D8",
                backgroundColor: isDark ? "#12100E" : "#FAF7F4",
              }}
            />
            {reasonError ? (
              <Text
                className="mt-1.5 text-xs font-semibold"
                style={{ color: "#DC2626" }}
              >
                {reasonError}
              </Text>
            ) : (
              <Text className="mt-1.5 text-[11px] text-ink-faint dark:text-ink-faint-dark">
                {reason.trim().length}/500 characters · the more specific, the
                better your advisor can prepare
              </Text>
            )}

            <Pressable
              onPress={confirmBooking}
              disabled={book.isPending}
              accessibilityRole="button"
              accessibilityLabel="Confirm the booking"
              className="mt-4 flex-row items-center justify-center gap-2 rounded-2xl py-4 active:opacity-85"
              style={{ backgroundColor: ORANGE, opacity: book.isPending ? 0.7 : 1 }}
            >
              {book.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <MaterialCommunityIcons
                    name="check-circle-outline"
                    size={19}
                    color="#fff"
                  />
                  <Text className="text-[15px] font-bold text-white">
                    Confirm booking
                  </Text>
                </>
              )}
            </Pressable>
            {book.isError ? (
              <Text
                className="mt-2 text-center text-xs font-semibold"
                style={{ color: "#DC2626" }}
              >
                The booking failed. Please try again.
              </Text>
            ) : null}
            <Pressable
              onPress={() => setSelectedSlot(null)}
              className="mt-1 items-center py-3"
              hitSlop={10}
            >
              <Text className="text-sm font-semibold text-ink-muted dark:text-ink-muted-dark">
                Pick another slot
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
                style={{
                  backgroundColor: "#FEF2F2",
                  borderWidth: 1,
                  borderColor: "#FECACA",
                }}
              >
                <MaterialCommunityIcons
                  name="calendar-remove-outline"
                  size={22}
                  color="#DC2626"
                />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-ink dark:text-ink-dark">
                  Cancel this session?
                </Text>
                <Text className="mt-0.5 text-xs text-ink-muted dark:text-ink-muted-dark">
                  {longDate(dateOf(cancelTarget.startTime))} ·{" "}
                  {timeOf(cancelTarget.startTime)}–
                  {timeOf(cancelTarget.endTime)}
                </Text>
              </View>
            </View>

            <Text className="mb-2 mt-4 text-sm font-bold text-ink dark:text-ink-dark">
              Tell your advisor why <Text style={{ color: "#DC2626" }}>*</Text>
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
                      borderColor: active
                        ? "#DC2626"
                        : isDark
                          ? "#302A24"
                          : "#EAE1D8",
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
                      style={{
                        borderColor: active
                          ? "#DC2626"
                          : isDark
                            ? "#4A423B"
                            : "#C3B8AD",
                      }}
                    >
                      {active && (
                        <View
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: "#DC2626" }}
                        />
                      )}
                    </View>
                    <Text
                      className="flex-1 text-sm"
                      style={{
                        color: active
                          ? isDark
                            ? "#FCA5A5"
                            : "#991B1B"
                          : isDark
                            ? "#F7F2EC"
                            : "#191512",
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
              placeholder="Or write another reason…"
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
                  Keep it
                </Text>
              </Pressable>
              <Pressable
                onPress={confirmCancel}
                disabled={
                  !(cancelReason || cancelCustom.trim()) || cancel.isPending
                }
                className="flex-[1.4] items-center justify-center rounded-2xl py-4 active:opacity-85"
                style={{
                  backgroundColor: "#DC2626",
                  opacity:
                    !(cancelReason || cancelCustom.trim()) || cancel.isPending
                      ? 0.45
                      : 1,
                }}
              >
                {cancel.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-[15px] font-bold text-white">
                    Confirm cancel
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        )}
      </Sheet>

      {/* ── Toast ── */}
      {toast ? (
        <View
          pointerEvents="none"
          className="absolute inset-x-0 bottom-6 items-center px-6"
        >
          <View
            className="w-full max-w-md flex-row items-center gap-2.5 rounded-2xl px-4 py-3"
            style={{
              backgroundColor: isDark ? "#2A2320" : "#241C17",
              shadowColor: "#000",
              shadowOpacity: 0.25,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 4 },
              elevation: 6,
            }}
          >
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={18}
              color="#FFA371"
            />
            <Text className="flex-1 text-xs leading-4 text-white">{toast}</Text>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

// ── Pieces ───────────────────────────────────────────────────────────────────

function SlotGroup({
  title,
  icon,
  slots,
  selectedStart,
  onPick,
  isDark,
}: {
  title: string;
  icon: string;
  slots: AvailableSlot[];
  selectedStart: string | null;
  onPick: (s: AvailableSlot) => void;
  isDark: boolean;
}) {
  if (slots.length === 0) return null;
  return (
    <View className="mt-3">
      <View className="mb-2 flex-row items-center gap-1.5">
        <MaterialCommunityIcons name={icon as never} size={15} color={ORANGE} />
        <Text className="text-[13px] font-bold text-ink-muted dark:text-ink-muted-dark">
          {title} ({slots.length})
        </Text>
      </View>
      <View className="flex-row flex-wrap" style={{ gap: 10 }}>
        {slots.map((s) => {
          const selected = s.startTime === selectedStart;
          const label = timeOf(s.startTime);
          return (
            <Pressable
              key={s.startTime}
              onPress={() => onPick(s)}
              accessibilityRole="button"
              accessibilityLabel={`${label} to ${timeOf(s.endTime)}`}
              className="items-center justify-center rounded-2xl py-3.5 active:opacity-70"
              style={{
                width: "31%",
                backgroundColor: selected
                  ? ORANGE
                  : isDark
                    ? "#1B1815"
                    : "#fff",
                borderWidth: 1.5,
                borderColor: selected
                  ? ORANGE
                  : isDark
                    ? "#3A2A1C"
                    : "#FFD9BE",
              }}
            >
              <Text
                className="text-[15px] font-bold tabular-nums"
                style={{
                  color: selected ? "#fff" : isDark ? "#F7F2EC" : "#191512",
                }}
              >
                {label}
              </Text>
              <Text
                className="mt-0.5 text-[10px] font-semibold"
                style={{
                  color: selected
                    ? "rgba(255,255,255,0.85)"
                    : isDark
                      ? "#7D746C"
                      : "#8B8178",
                }}
              >
                Open
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
  appointment: BookedAppointment;
  advisorName: string;
  isDark: boolean;
  highlight: boolean;
  onCancel: () => void;
}) {
  const v = shortDate(dateOf(appointment.startTime));
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
          <Text className="text-lg font-bold leading-5 text-white tabular-nums">
            {v.day}
          </Text>
          <Text className="text-[10px] font-bold text-white">
            {v.mon} · {v.dow}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-[15px] font-bold text-ink tabular-nums dark:text-ink-dark">
            {timeOf(appointment.startTime)} – {timeOf(appointment.endTime)}
          </Text>
          <Text
            className="mt-0.5 text-[11px] text-ink-muted dark:text-ink-muted-dark"
            numberOfLines={1}
          >
            {advisorName}
          </Text>
        </View>
        {highlight && (
          <View
            className="rounded-full px-2.5 py-1"
            style={{ backgroundColor: ORANGE }}
          >
            <Text className="text-[10px] font-bold text-white">NEW</Text>
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
            <MaterialCommunityIcons
              name="clock-outline"
              size={16}
              color={isDark ? "#FFA371" : ORANGE_DEEP}
            />
            <Text
              className="text-xs font-bold"
              style={{ color: isDark ? "#FFA371" : ORANGE_DEEP }}
            >
              {appointment.status === "PENDING" ? "Awaiting confirmation" : "Confirmed"}
            </Text>
          </View>
          <Pressable
            onPress={onCancel}
            accessibilityRole="button"
            accessibilityLabel="Cancel this session"
            className="flex-1 items-center justify-center rounded-2xl border py-3 active:opacity-70"
            style={{ borderColor: "#FECACA", backgroundColor: isDark ? "#2A1512" : "#fff" }}
          >
            <Text className="text-xs font-bold" style={{ color: "#DC2626" }}>
              Cancel
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
