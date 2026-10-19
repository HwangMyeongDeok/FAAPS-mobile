import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Save } from "lucide-react-native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
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
  profileKeys,
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
  const qc = useQueryClient();

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

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-900">
        <ActivityIndicator color="#F36F21" />
      </SafeAreaView>
    );
  }
  if (isError || !data) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-900">
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
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900" edges={["top"]}>
      <ScreenHeader
        title="Hồ sơ cá nhân"
        subtitle="Quản lý thông tin cá nhân và chuyên ngành"
        right={
          <TouchableOpacity
            onPress={signOut}
            className="flex-row items-center gap-1 rounded-full bg-red-50 px-3 py-2"
          >
            <LogOut {...({ size: 14, color: "#DC2626" } as any)} />
            <Text className="text-xs font-semibold text-red-600">Sign out</Text>
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
            <View className="h-24 w-24 rounded-full bg-primary-500 items-center justify-center mb-3 shadow-md">
              <Text className="text-3xl font-bold text-white">
                {data.user.full_name.charAt(0)}
              </Text>
            </View>
            <Text className="text-lg font-bold text-slate-900 dark:text-white">
              {data.user.full_name}
            </Text>
            <Text className="text-sm text-slate-500">{data.user.email}</Text>
            <View className="mt-2 rounded-full bg-green-100 px-3 py-1">
              <Text className="text-xs font-medium text-green-700">
                {data.user.status}
              </Text>
            </View>
          </View>

          {/* Editable fields */}
          <Section title="Thông tin cơ bản">
            <Field
              label="Họ và tên"
              value={form.watch("full_name")}
              editable={editing}
              onChangeText={(t) => form.setValue("full_name", t, { shouldValidate: true })}
              error={form.formState.errors.full_name?.message}
            />
            <Field
              label="Email"
              value={form.watch("email")}
              editable={editing}
              onChangeText={(t) => form.setValue("email", t, { shouldValidate: true })}
              error={form.formState.errors.email?.message}
              keyboardType="email-address"
            />
            <Field
              label="Số điện thoại"
              value={form.watch("phone")}
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
            <Text className="text-xs text-slate-500 mb-3">
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
                        ? "border-primary-500 bg-primary-50"
                        : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800",
                    ].join(" ")}
                  >
                    <View
                      className={[
                        "h-5 w-5 mt-0.5 rounded-full border-2 items-center justify-center",
                        selected
                          ? "border-primary-500 bg-primary-500"
                          : "border-slate-300",
                      ].join(" ")}
                    >
                      {selected ? (
                        <View className="h-2 w-2 rounded-full bg-white" />
                      ) : null}
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-slate-900 dark:text-white">
                        {sp.name}
                      </Text>
                      {sp.description ? (
                        <Text className="text-xs text-slate-500 mt-1">
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
                  className="self-start mt-1"
                >
                  <Text className="text-xs text-slate-500 underline">
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
                <View className="h-12 w-12 rounded-full bg-primary-100 items-center justify-center">
                  <Text className="text-base font-bold text-primary-700">
                    {data.advisor.user.full_name.charAt(0)}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-slate-900 dark:text-white">
                    {data.advisor.user.full_name}
                  </Text>
                  <Text className="text-xs text-slate-500">
                    {data.advisor.user.email}
                  </Text>
                  {data.advisor.user.phone ? (
                    <Text className="text-xs text-slate-400 mt-0.5">
                      {data.advisor.user.phone}
                    </Text>
                  ) : null}
                </View>
              </View>
            ) : (
              <Text className="text-sm text-slate-500">
                Chưa có advisor được phân công.
              </Text>
            )}
          </Section>

          <Text className="text-center text-xs text-slate-400 mt-6">
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
    <View className="rounded-2xl bg-white dark:bg-slate-800 p-5 mb-5 border border-slate-100 dark:border-slate-700">
      <Text className="text-base font-semibold text-slate-900 dark:text-white mb-4">
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
        last ? "" : "border-b border-slate-100 dark:border-slate-700",
      ].join(" ")}
    >
      <Text className="text-sm text-slate-500">{label}</Text>
      <Text className="text-sm font-semibold text-slate-900 dark:text-white">
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
    <View className={["py-2", last ? "" : "border-b border-slate-100 dark:border-slate-700"].join(" ")}>
      <Text className="text-xs text-slate-500 mb-1.5">{label}</Text>
      <TextInput
        editable={editable}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType ?? "default"}
        autoCapitalize="none"
        className={[
          "rounded-lg px-3 py-2 text-sm",
          editable
            ? "bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600"
            : "text-slate-900 dark:text-white",
        ].join(" ")}
      />
      {error ? <Text className="text-xs text-red-500 mt-1">{error}</Text> : null}
    </View>
  );
}
