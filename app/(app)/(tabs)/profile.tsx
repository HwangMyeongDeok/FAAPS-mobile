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
import {
  useMyProfile,
  useUpdateMyProfile,
  useUpdateMySpecialization,
} from "@/lib/queries/profile";
import { useAuthStore } from "@/stores/auth";

const profileSchema = z.object({
  full_name: z.string().min(2, "Họ tên tối thiểu 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().min(8, "Số điện thoại quá ngắn").or(z.literal("")),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfileScreen() {
  const userId = useAuthStore((s) => s.session?.user.id ?? null);
  const signOut = useAuthStore((s) => s.signOut);

  const { data, isLoading, isError } = useMyProfile(userId);
  const updateProfile = useUpdateMyProfile(userId!);
  const updateSpec = useUpdateMySpecialization(userId!);

  const [editing, setEditing] = useState(false);

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: data
      ? {
          full_name: data.user.full_name,
          email: data.user.email,
          phone: data.user.phone ?? "",
        }
      : undefined,
  });

  // `useWatch` instead of `form.watch()` — the latter returns a function that
  // React Compiler cannot memoize safely (react-hooks/incompatible-library).
  const [fullName, email, phone] = useWatch({
    control: form.control,
    name: ["full_name", "email", "phone"],
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
        <Text className="text-red-500">Không tải được hồ sơ.</Text>
      </SafeAreaView>
    );
  }

  const onSubmit = form.handleSubmit(async (values) => {
    await updateProfile.mutateAsync({
      full_name: values.full_name,
      email: values.email,
      phone: values.phone,
    });
    setEditing(false);
  });

  return (
    <SafeAreaView className="flex-1 bg-ground dark:bg-ground-dark" edges={["top"]}>
      <ScreenHeader
        title="Hồ sơ cá nhân"
        subtitle="Quản lý thông tin cá nhân và chuyên ngành"
        right={
          <TouchableOpacity
            onPress={signOut}
            accessibilityRole="button"
            accessibilityLabel="Sign out"
            hitSlop={10}
            className="flex-row items-center gap-1 rounded-full bg-brand-tint px-3.5 py-2.5 dark:bg-brand-tint-dark"
          >
            <LogOut {...({ size: 14, color: "#B5460D" } as any)} />
            <Text className="text-xs font-semibold text-brand-ink dark:text-brand-ink-dark">Sign out</Text>
          </TouchableOpacity>
        }
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-5 py-5" contentContainerStyle={{ paddingBottom: 60 }}>
          {/* Avatar & identity */}
          <View className="items-center mb-6">
            <View className="h-24 w-24 rounded-full items-center justify-center mb-3" style={{ backgroundColor: "#F36F21" }}>
              <Text className="text-3xl font-bold text-white">
                {data.user.full_name.charAt(0)}
              </Text>
            </View>
            <Text className="text-lg font-bold text-ink dark:text-ink-dark">
              {data.user.full_name}
            </Text>
            <Text className="text-sm text-ink-muted dark:text-ink-muted-dark">{data.user.email}</Text>
            <View className="mt-2 rounded-full bg-green-100 px-3 py-1 dark:bg-green-900/30">
              <Text className="text-xs font-medium text-green-700 dark:text-green-300">
                {data.user.status}
              </Text>
            </View>
          </View>

          {/* Editable fields */}
          <Section title="Thông tin cơ bản">
            <Field
              label="Họ và tên"
              value={fullName ?? ""}
              editable={editing}
              onChangeText={(t) => form.setValue("full_name", t, { shouldValidate: true })}
              error={form.formState.errors.full_name?.message}
            />
            <Field
              label="Email"
              value={email ?? ""}
              editable={editing}
              onChangeText={(t) => form.setValue("email", t, { shouldValidate: true })}
              error={form.formState.errors.email?.message}
              keyboardType="email-address"
            />
            <Field
              label="Số điện thoại"
              value={phone ?? ""}
              editable={editing}
              onChangeText={(t) => form.setValue("phone", t, { shouldValidate: true })}
              error={form.formState.errors.phone?.message}
              keyboardType="phone-pad"
              last
            />
            <View className="flex-row gap-3 mt-4">
              {editing ? (
                <>
                  <View className="flex-1">
                    <Button
                      label="Hủy"
                      variant="secondary"
                      onPress={() => {
                        form.reset();
                        setEditing(false);
                      }}
                    />
                  </View>
                  <View className="flex-1">
                    <Button
                      label="Lưu"
                      variant="primary"
                      onPress={onSubmit}
                      loading={updateProfile.isPending}
                      leftIcon={<Save {...({ size: 16, color: "#fff" } as any)} />}
                    />
                  </View>
                </>
              ) : (
                <Button label="Chỉnh sửa" onPress={() => setEditing(true)} />
              )}
            </View>
          </Section>

          {/* Academic info (read-only — assigned by Admin) */}
          <Section title="Chương trình học">
            <Row label="Mã sinh viên" value={data.student.student_code} />
            <Row label="Major" value={data.major.name} />
            <Row label="Curriculum" value={data.curriculum_version.name} />
            <Row
              label="Trạng thái"
              value={data.student.academic_status}
              last
            />
          </Section>

          {/* Specialization (student-selectable) */}
          <Section title="Chuyên ngành hẹp (Specialization)">
            <Text className="text-xs text-ink-muted dark:text-ink-muted-dark mb-3">
              Bạn có thể chọn một chuyên ngành hẹp phù hợp với curriculum hiện tại.
              Chuyên ngành sẽ giúp AI và advisor tư vấn chính xác hơn.
            </Text>
            <View className="gap-2">
              {data.available_specializations.map((sp: { id: string; name: string; description?: string | null }) => {
                const selected = data.specialization?.id === sp.id;
                return (
                  <TouchableOpacity
                    key={sp.id}
                    onPress={() => updateSpec.mutate(sp.id)}
                    disabled={updateSpec.isPending}
                    className={[
                      "rounded-xl border p-3 flex-row items-start gap-3",
                      selected
                        ? "border-[#F36F21] bg-brand-tint dark:bg-brand-tint-dark"
                        : "border-line bg-surface dark:border-line-dark dark:bg-surface-dark",
                    ].join(" ")}
                  >
                    <View
                      className={[
                        "h-5 w-5 mt-0.5 rounded-full border-2 items-center justify-center",
                        selected
                          ? "border-[#F36F21]"
                          : "border-line dark:border-line-dark",
                      ].join(" ")}
                      style={selected ? { backgroundColor: "#F36F21" } : undefined}
                    >
                      {selected ? (
                        <View className="h-2 w-2 rounded-full bg-white" />
                      ) : null}
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-ink dark:text-ink-dark">
                        {sp.name}
                      </Text>
                      {sp.description ? (
                        <Text className="text-xs text-ink-muted dark:text-ink-muted-dark mt-1">
                          {sp.description}
                        </Text>
                      ) : null}
                    </View>
                  </TouchableOpacity>
                );
              })}
              {data.specialization ? (
                <TouchableOpacity
                  onPress={() => updateSpec.mutate(null)}
                  hitSlop={12}
                  accessibilityRole="button"
                  className="self-start mt-1 py-2"
                >
                  <Text className="text-xs font-medium text-ink-muted dark:text-ink-muted-dark underline">
                    Bỏ chọn chuyên ngành
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </Section>

          {/* Assigned advisor */}
          <Section title="Advisor được phân công">
            {data.advisor ? (
              <View className="flex-row items-center gap-3">
                <View className="h-12 w-12 rounded-full bg-brand-tint dark:bg-brand-tint-dark items-center justify-center">
                  <Text className="text-base font-bold text-brand-ink dark:text-brand-ink-dark">
                    {data.advisor.user.full_name.charAt(0)}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-ink dark:text-ink-dark">
                    {data.advisor.user.full_name}
                  </Text>
                  <Text className="text-xs text-ink-muted dark:text-ink-muted-dark">
                    {data.advisor.user.email}
                  </Text>
                  {data.advisor.user.phone ? (
                    <Text className="text-xs text-ink-faint dark:text-ink-faint-dark mt-0.5">
                      {data.advisor.user.phone}
                    </Text>
                  ) : null}
                </View>
              </View>
            ) : (
              <Text className="text-sm text-ink-muted dark:text-ink-muted-dark">
                Chưa có advisor được phân công.
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
  keyboardType,
  last,
}: {
  label: string;
  value: string;
  editable: boolean;
  onChangeText: (s: string) => void;
  error?: string;
  keyboardType?: "default" | "email-address" | "phone-pad";
  last?: boolean;
}) {
  return (
    <View className={["py-2", last ? "" : "border-b border-rule dark:border-rule-dark"].join(" ")}>
      <Text className="text-xs text-ink-muted dark:text-ink-muted-dark mb-1.5">{label}</Text>
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
    </View>
  );
}
