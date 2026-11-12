/**
 * FE-S — Appointment booking: schedule a 1-on-1 session with your advisor.
 *
 * Container keeps all data logic (React Query + selection state).
 * Every visual block lives in `src/modules/appointments/components/`.
 */

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
import {
  ORANGE,
  ORANGE_DEEP,
  dateOf,
  timeOf,
  toISODate,
} from "@/modules/appointments/format";
import { AdvisorStrip } from "@/modules/appointments/components/AdvisorStrip";
import { MonthCalendar } from "@/modules/appointments/components/MonthCalendar";
import { SlotsSection } from "@/modules/appointments/components/SlotsSection";
import {
  AppointmentToast,
  BookingSuccessBanner,
  SessionsSection,
} from "@/modules/appointments/components/SessionsSection";
import { BookingSheetContent } from "@/modules/appointments/components/BookingSheet";
import { CancelSheetContent } from "@/modules/appointments/components/CancelSheet";

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
  const hasNoAdvisor = !advisorLoading && !advisorError && !advisor;

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
    () =>
      appointments.filter(
        (a) => a.status === "PENDING" || a.status === "ACCEPTED" || a.status === "SCHEDULED",
      ),
    [appointments],
  );
  const history = useMemo(
    () =>
      appointments.filter(
        (a) => a.status !== "PENDING" && a.status !== "ACCEPTED" && a.status !== "SCHEDULED",
      ),
    [appointments],
  );
  const upcomingDates = useMemo(() => new Set(upcoming.map((a) => dateOf(a.startTime))), [upcoming]);
  const morning = useMemo(() => slots.filter((s) => timeOf(s.startTime) < "12:00"), [slots]);
  const afternoon = useMemo(() => slots.filter((s) => timeOf(s.startTime) >= "12:00"), [slots]);

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
    if (!advisorId) {
      Alert.alert(
        "No advisor assigned",
        "You don't have an assigned advisor yet. Please contact the admin.",
      );
      setToast("You don't have an assigned advisor yet. Please contact the admin.");
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
      { advisorId, startTime: selectedSlot.startTime, reason: r },
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ORANGE} />
        }
      >
        <AdvisorStrip
          advisor={advisor}
          loading={advisorLoading}
          error={advisorError}
          hasNoAdvisor={hasNoAdvisor}
          isDark={isDark}
          onRetry={() => refetchAdvisor()}
        />

        {justBookedId ? <BookingSuccessBanner onDismiss={() => setJustBooked(null)} /> : null}

        <MonthCalendar
          monthCursor={monthCursor}
          selectedDate={selectedDate}
          todayISO={todayISO}
          upcomingDates={upcomingDates}
          isDark={isDark}
          onShiftMonth={shiftMonth}
          onPickDate={pickDate}
        />

        <SlotsSection
          advisorLoading={advisorLoading}
          slotsLoading={slotsLoading}
          advisorError={advisorError}
          slotsError={slotsError}
          hasNoAdvisor={hasNoAdvisor}
          slots={slots}
          morning={morning}
          afternoon={afternoon}
          selectedStart={selectedSlot?.startTime ?? null}
          isDark={isDark}
          onPick={(s) => setSelectedSlot(s)}
          onRetryAdvisor={() => refetchAdvisor()}
          onRetrySlots={() => refetchSlots()}
        />

        <SessionsSection
          upcoming={upcoming}
          history={history}
          apptsLoading={apptsLoading}
          advisorName={advisor?.fullName ?? "Advisor"}
          justBookedId={justBookedId}
          isDark={isDark}
          onCancel={(a) => setCancelTarget(a)}
        />
      </ScrollView>

      <Sheet open={!!selectedSlot} onClose={() => setSelectedSlot(null)}>
        {selectedSlot ? (
          <BookingSheetContent
            selectedSlot={selectedSlot}
            advisor={advisor}
            reason={reason}
            reasonError={reasonError}
            pending={book.isPending}
            bookError={book.isError}
            isDark={isDark}
            onReasonChange={(t) => {
              setReason(t);
              if (reasonError) setReasonError(null);
            }}
            onQuickPick={(q) => {
              setReason((prev) => (prev ? prev : q));
              setReasonError(null);
            }}
            onConfirm={confirmBooking}
            onPickAnother={() => setSelectedSlot(null)}
          />
        ) : null}
      </Sheet>

      <Sheet open={!!cancelTarget} onClose={() => setCancelTarget(null)}>
        {cancelTarget ? (
          <CancelSheetContent
            cancelTarget={cancelTarget}
            cancelReason={cancelReason}
            cancelCustom={cancelCustom}
            pending={cancel.isPending}
            isDark={isDark}
            onPickReason={(r) => {
              setCancelReason(r);
              setCancelCustom("");
            }}
            onCustomChange={setCancelCustom}
            onKeep={() => setCancelTarget(null)}
            onConfirm={confirmCancel}
          />
        ) : null}
      </Sheet>

      {toast ? <AppointmentToast message={toast} /> : null}
    </SafeAreaView>
  );
}
