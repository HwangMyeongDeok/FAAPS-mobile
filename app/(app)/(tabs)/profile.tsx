import { zodResolver } from "@hookform/resolvers/zod";
import { LogOut, Save } from "lucide-react-native";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import { Button } from "@/components/Button";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useMyAdvisor, useMyProfile, useUpdateMyProfile } from "@/lib/queries/profile";
import { useAuthStore } from "@/stores/auth";

const profileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phone: z.string().min(8, "Phone number is too short").or(z.literal("")),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfileScreen() {
  const signOut = useAuthStore((s) => s.signOut);

  const { data, isLoading, isError } = useMyProfile();
  const {
    data: advisor,
    isError: advisorError,
    refetch: refetchAdvisor,
  } = useMyAdvisor();
  const updateProfile = useUpdateMyProfile();

  const [editing, setEditing] = useState(false);

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: data
      ? {
          fullName: data.fullName,
          phone: data.phone ?? "",
        }
      : undefined,
  });

  // `useWatch` instead of `form.watch()` — the latter returns a function that
  // React Compiler cannot memoize safely (react-hooks/incompatible-library).
  const [fullName, phone] = useWatch({
    control: form.control,
    name: ["fullName", "phone"],
  });

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-ground dark:bg-ground-dark">
        <ActivityIndicator color="#F36F21" />
      </SafeAreaView>
    );
  }
  if (isError || !data) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-ground dark:bg-ground-dark">
        <Text className="text-red-500">Could not load your profile.</Text>
      </SafeAreaView>
    );
  }

  const onSubmit = form.handleSubmit(async (values) => {
    await updateProfile.mutateAsync({
      fullName: values.fullName,
      phone: values.phone,
    });
    setEditing(false);
  });

  return (
    <SafeAreaView className="flex-1 bg-ground dark:bg-ground-dark" edges={["top"]}>
      <ScreenHeader
        title="My profile"
        subtitle="Manage your personal information"
        right={
          <TouchableOpacity
            onPress={signOut}
            accessibilityRole="button"
            accessibilityLabel="Sign out"
            hitSlop={10}
            className="flex-row items-center gap-1 rounded-full bg-brand-tint px-3.5 py-2.5 dark:bg-brand-tint-dark"
          >
            <LogOut {...({ size: 14, color: "#B5460D" } as any)} />
            <Text className="text-xs font-semibold text-brand-ink dark:text-brand-ink-dark">
              Sign out
            </Text>
          </TouchableOpacity>
        }
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-5 py-5"
          contentContainerStyle={{ paddingBottom: 60 }}
        >
          {/* Avatar & identity */}
          <View className="items-center mb-6">
            <View
              className="h-24 w-24 rounded-full items-center justify-center mb-3"
              style={{ backgroundColor: "#F36F21" }}
            >
              <Text className="text-3xl font-bold text-white">
                {data.fullName.charAt(0)}
              </Text>
            </View>
            <Text className="text-lg font-bold text-ink dark:text-ink-dark">
              {data.fullName}
            </Text>
            <Text className="text-sm text-ink-muted dark:text-ink-muted-dark">
              {data.email}
            </Text>
            <View className="mt-2 rounded-full bg-green-100 px-3 py-1 dark:bg-green-900/30">
              <Text className="text-xs font-medium text-green-700 dark:text-green-300">
                {data.accountStatus}
              </Text>
            </View>
          </View>

          {/* Editable fields */}
          <Section title="Basic information">
            <Field
              label="Full name"
              value={fullName ?? ""}
              editable={editing}
              onChangeText={(t) =>
                form.setValue("fullName", t, { shouldValidate: true })
              }
              error={form.formState.errors.fullName?.message}
            />
            <Field
              label="Email"
              value={data.email}
              editable={false}
              onChangeText={() => {}}
              note="Your email is managed by the university."
            />
            <Field
              label="Phone number"
              value={phone ?? ""}
              editable={editing}
              onChangeText={(t) =>
                form.setValue("phone", t, { shouldValidate: true })
              }
              error={form.formState.errors.phone?.message}
              keyboardType="phone-pad"
              last
            />
            <View className="flex-row gap-3 mt-4">
              {editing ? (
                <>
                  <View className="flex-1">
                    <Button
                      label="Cancel"
                      variant="secondary"
                      onPress={() => {
                        form.reset();
                        setEditing(false);
                      }}
                    />
                  </View>
                  <View className="flex-1">
                    <Button
                      label="Save"
                      variant="primary"
                      onPress={onSubmit}
                      loading={updateProfile.isPending}
                      leftIcon={<Save {...({ size: 16, color: "#fff" } as any)} />}
                    />
                  </View>
                </>
              ) : (
                <Button label="Edit profile" onPress={() => setEditing(true)} />
              )}
            </View>
          </Section>

          {/* Academic info (read-only — assigned by Admin) */}
          <Section title="Academic programme">
            <Row label="Student ID" value={data.studentCode ?? "—"} />
            <Row label="Major" value={data.majorName ?? "—"} />
            <Row label="Curriculum" value={data.cohort ?? "—"} />
            <Row label="Current semester" value={String(data.currentSemester ?? "—")} />
            <Row label="Academic status" value={data.academicStatus ?? "—"} last />
          </Section>

          {/* Assigned advisor */}
          <Section title="Assigned advisor">
            {advisorError ? (
              // A network/server failure — not "you have no advisor".
              <View className="flex-row items-center gap-3">
                <Text className="flex-1 text-sm text-ink-muted dark:text-ink-muted-dark">
                  Could not load your advisor. Check your connection.
                </Text>
                <TouchableOpacity
                  onPress={() => refetchAdvisor()}
                  className="rounded-full bg-brand-tint px-3 py-1.5 active:opacity-70 dark:bg-brand-tint-dark"
                >
                  <Text className="text-xs font-bold text-brand-ink dark:text-brand-ink-dark">
                    Try again
                  </Text>
                </TouchableOpacity>
              </View>
            ) : advisor ? (
              <View className="flex-row items-center gap-3">
                <View className="h-12 w-12 rounded-full bg-brand-tint dark:bg-brand-tint-dark items-center justify-center">
                  <Text className="text-base font-bold text-brand-ink dark:text-brand-ink-dark">
                    {advisor.fullName.charAt(0)}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-ink dark:text-ink-dark">
                    {advisor.fullName}
                  </Text>
                  <Text className="text-xs text-ink-muted dark:text-ink-muted-dark">
                    {advisor.email}
                  </Text>
                  {advisor.phone ? (
                    <Text className="text-xs text-ink-faint dark:text-ink-faint-dark mt-0.5">
                      {advisor.phone}
                    </Text>
                  ) : null}
                </View>
              </View>
            ) : (
              <Text className="text-sm text-ink-muted dark:text-ink-muted-dark">
                No advisor has been assigned to you yet.
              </Text>
            )}
          </Section>

          <Text className="text-center text-xs text-ink-faint dark:text-ink-faint-dark mt-6">
            FAAPS © 2026 FPT University HCMC
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// =================================================================
// Local helpers
// =================================================================

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="rounded-3xl bg-surface dark:bg-surface-dark p-5 mb-4 border border-line dark:border-line-dark">
      <Text className="text-base font-semibold text-ink dark:text-ink-dark mb-4">
        {title}
      </Text>
      {children}
    </View>
  );
}

function Row({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View
      className={[
        "flex-row items-center justify-between py-2.5",
        last ? "" : "border-b border-rule dark:border-rule-dark",
      ].join(" ")}
    >
      <Text className="text-sm text-ink-muted dark:text-ink-muted-dark">{label}</Text>
      <Text className="text-sm font-semibold text-ink dark:text-ink-dark">
        {value}
      </Text>
    </View>
  );
}

function Field({
  label,
  value,
  editable,
  onChangeText,
  error,
  note,
  keyboardType,
  last,
}: {
  label: string;
  value: string;
  editable: boolean;
  onChangeText: (s: string) => void;
  error?: string;
  note?: string;
  keyboardType?: "default" | "email-address" | "phone-pad";
  last?: boolean;
}) {
  return (
    <View
      className={["py-2", last ? "" : "border-b border-rule dark:border-rule-dark"].join(
        " ",
      )}
    >
      <Text className="text-xs text-ink-muted dark:text-ink-muted-dark mb-1.5">
        {label}
      </Text>
      <TextInput
        editable={editable}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType ?? "default"}
        autoCapitalize="none"
        placeholderTextColor="#8B8178"
        className={[
          "rounded-xl px-3 py-2.5 text-sm",
          editable
            ? "bg-raised dark:bg-raised-dark text-ink dark:text-ink-dark border border-line dark:border-line-dark"
            : "text-ink dark:text-ink-dark",
        ].join(" ")}
      />
      {error ? <Text className="text-xs text-red-500 mt-1">{error}</Text> : null}
      {note ? (
        <Text className="text-[11px] text-ink-faint dark:text-ink-faint-dark mt-1">
          {note}
        </Text>
      ) : null}
    </View>
  );
}
