import { zodResolver } from "@hookform/resolvers/zod";
import {
  BookOpen,
  ChevronRight,
  ChevronDown,
  ClipboardCheck,
  LogOut,
  Mail,
  Phone,
  Save,
  UserRound,
  Users,
} from "lucide-react-native";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { z } from "zod";

import { AppBadge } from "@/components/ui/AppBadge";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ScreenHeader } from "@/components/ScreenHeader";
import { ErrorBlock } from "@/components/feedback";
import { SkeletonBlock } from "@/components/ui/SkeletonBlock";
import { Field, Row, Section } from "@/modules/profile";
import { MenuGroup, MenuRow, INK, MUTED } from "@/modules/profile/components/MenuList";
import { useMyAdvisor, useMyProfile, useUpdateMyProfile } from "@/lib/queries/profile";
import { useAuthStore } from "@/stores/auth";

const profileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phone: z.string().min(8, "Phone number is too short").or(z.literal("")),
});

type ProfileForm = z.infer<typeof profileSchema>;

const initialsOf = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

export default function ProfileScreen() {
  const signOut = useAuthStore((s) => s.signOut);

  const { data, isLoading, isError, refetch } = useMyProfile();
  const { data: advisor, isError: advisorError, refetch: refetchAdvisor } = useMyAdvisor();
  const updateProfile = useUpdateMyProfile();

  const [editing, setEditing] = useState(false);
  const [openInfo, setOpenInfo] = useState(false);

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: data ? { fullName: data.fullName, phone: data.phone ?? "" } : undefined,
  });

  const [fullName, phone] = useWatch({ control: form.control, name: ["fullName", "phone"] });

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-ground dark:bg-ground-dark" edges={["top"]}>
        <View className="px-5 pt-6">
          <SkeletonBlock height={140} radius={16} />
          <SkeletonBlock height={56} radius={16} className="mt-4" />
          <SkeletonBlock height={56} radius={16} className="mt-3" />
          <SkeletonBlock height={56} radius={16} className="mt-3" />
          <View className="mt-6 items-center">
            <ActivityIndicator color="#F37021" />
          </View>
        </View>
      </SafeAreaView>
    );
  }
  if (isError || !data) {
    return (
      <SafeAreaView className="flex-1 bg-ground dark:bg-ground-dark" edges={["top"]}>
        <View className="flex-1 px-5 pt-6">
          <ErrorBlock
            title="Could not load your profile"
            message="Check your connection and try again."
            onRetry={() => refetch()}
          />
        </View>
      </SafeAreaView>
    );
  }

  const onSubmit = form.handleSubmit(async (values) => {
    await updateProfile.mutateAsync({ fullName: values.fullName, phone: values.phone });
    setEditing(false);
  });

  return (
    <SafeAreaView className="flex-1 bg-ground dark:bg-ground-dark" edges={["top"]}>
      <ScreenHeader title="My profile" subtitle="Manage your personal information" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 60 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Identity */}
          <AppCard className="items-center px-5 py-6">
            <View
              className="h-24 w-24 items-center justify-center rounded-full"
              style={{ backgroundColor: "#F37021" }}
            >
              <Text className="text-[30px]" style={{ color: "#FFFFFF", fontWeight: "700" }}>
                {initialsOf(data.fullName)}
              </Text>
            </View>
            <Text className="mt-3 text-[18px]" style={{ color: INK, fontWeight: "700" }}>
              {data.fullName}
            </Text>
            <Text className="mt-0.5 text-[13px]" style={{ color: MUTED }}>
              {data.email}
            </Text>
            <View className="mt-2.5 flex-row items-center gap-2">
              <AppBadge
                label={data.accountStatus ?? "ACTIVE"}
                tone={data.accountStatus === "ACTIVE" ? "success" : "neutral"}
                dot
              />
              {data.studentCode ? <AppBadge label={data.studentCode} tone="primary" /> : null}
            </View>
          </AppCard>

          {/* Menu */}
          <Text className="mb-2 mt-5 text-[12px]" style={{ color: MUTED, fontWeight: "600" }}>
            ACCOUNT
          </Text>
          <MenuGroup>
            <MenuRow
              icon={UserRound}
              title="Hồ sơ"
              subtitle="Tên, email, số điện thoại"
              onPress={() => {
                setOpenInfo(true);
                setEditing(false);
              }}
            />
            <MenuRow
              icon={Users}
              title="Cố vấn"
              subtitle={advisor ? advisor.fullName : "Chưa được phân công"}
              onPress={() => router.push("/(app)/advising")}
            />
            <MenuRow
              icon={BookOpen}
              title="Curriculum"
              subtitle={data.majorName ?? data.cohort ?? "Chương trình đào tạo"}
              onPress={() => router.push("/(app)/(tabs)/curriculum")}
            />
            <MenuRow
              icon={ClipboardCheck}
              title="Kế hoạch học tập"
              subtitle="Kế hoạch học từng môn và các task"
              onPress={() => router.push("/(app)/learning-plans")}
            />
            <MenuRow icon={LogOut} title="Đăng xuất" onPress={signOut} destructive isLast />
          </MenuGroup>

          {/* Inline detail for "Hồ sơ" — keeps the list short */}
          {openInfo ? (
            <>
              <Pressable
                onPress={() => setOpenInfo(false)}
                accessibilityRole="button"
                accessibilityLabel="Ẩn thông tin hồ sơ"
                className="mb-2 mt-5 flex-row items-center gap-1 active:opacity-70"
              >
                <ChevronDown size={14} color={MUTED} />
                <Text className="text-[12px]" style={{ color: MUTED, fontWeight: "600" }}>
                  THÔNG TIN HỒ SƠ
                </Text>
              </Pressable>

              <Section title="Thông tin cơ bản">
                {editing ? (
                  <>
                    <Field
                      label="Họ và tên"
                      value={fullName ?? ""}
                      editable
                      onChangeText={(t) => form.setValue("fullName", t, { shouldValidate: true })}
                      error={form.formState.errors.fullName?.message}
                    />
                    <Field
                      label="Số điện thoại"
                      value={phone ?? ""}
                      editable
                      onChangeText={(t) => form.setValue("phone", t, { shouldValidate: true })}
                      error={form.formState.errors.phone?.message}
                      keyboardType="phone-pad"
                      last
                    />
                    <View className="mt-3 flex-row gap-3">
                      <View className="flex-1">
                        <AppButton
                          label="Huỷ"
                          variant="outline"
                          onPress={() => {
                            form.reset();
                            setEditing(false);
                          }}
                        />
                      </View>
                      <View className="flex-1">
                        <AppButton
                          label="Lưu"
                          onPress={onSubmit}
                          loading={updateProfile.isPending}
                          icon={<Save size={16} color="#FFFFFF" />}
                        />
                      </View>
                    </View>
                  </>
                ) : (
                  <>
                    <ContactRow icon={UserRound} label={data.fullName} note="Họ và tên" />
                    <ContactRow icon={Mail} label={data.email} note="Email · do trường quản lý" />
                    <ContactRow
                      icon={Phone}
                      label={data.phone || "Chưa cập nhật"}
                      note="Số điện thoại"
                      last
                    />
                    <View className="mt-3">
                      <AppButton label="Chỉnh sửa" variant="accentOutline" onPress={() => setEditing(true)} />
                    </View>
                  </>
                )}
              </Section>

              <Section title="Chương trình học">
                <Row label="Mã sinh viên" value={data.studentCode ?? "—"} />
                <Row label="Ngành" value={data.majorName ?? "—"} />
                <Row label="Curriculum" value={data.cohort ?? "—"} />
                <Row label="Học kỳ hiện tại" value={String(data.currentSemester ?? "—")} />
                <Row label="Tình trạng học vụ" value={data.academicStatus ?? "—"} last />
              </Section>

              <Section title="Cố vấn học tập">
                {advisorError ? (
                  <View className="flex-row items-center gap-3">
                    <Text className="flex-1 text-sm" style={{ color: MUTED }}>
                      Không tải được thông tin cố vấn.
                    </Text>
                    <TouchableOpacity
                      onPress={() => refetchAdvisor()}
                      className="rounded-full px-3 py-1.5 active:opacity-70"
                      style={{ backgroundColor: "#FFF1E7" }}
                    >
                      <Text className="text-xs" style={{ color: "#B45309", fontWeight: "700" }}>
                        Thử lại
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : advisor ? (
                  <Pressable
                    onPress={() => router.push("/(app)/advising")}
                    accessibilityRole="button"
                    accessibilityLabel={`Nhắn tin cho ${advisor.fullName}`}
                    className="flex-row items-center gap-3 active:opacity-70"
                  >
                    <View
                      className="h-12 w-12 items-center justify-center rounded-full"
                      style={{ backgroundColor: "#FFF1E7" }}
                    >
                      <Text className="text-base" style={{ color: "#B45309", fontWeight: "700" }}>
                        {advisor.fullName.charAt(0)}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm" style={{ color: INK, fontWeight: "600" }}>
                        {advisor.fullName}
                      </Text>
                      <Text className="text-xs" style={{ color: MUTED }}>
                        {advisor.email}
                      </Text>
                    </View>
                    <ChevronRight size={18} color="#9CA3AF" />
                  </Pressable>
                ) : (
                  <EmptyState
                    muted
                    icon={<Users size={22} color={MUTED} />}
                    title="Chưa có cố vấn"
                    message="Bạn chưa được phân công cố vấn học tập."
                  />
                )}
              </Section>
            </>
          ) : null}

          <Text className="mt-6 text-center text-[11px]" style={{ color: MUTED }}>
            FAAPS © 2026 FPT University HCMC
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/** One read-only contact line with a small icon. */
function ContactRow({
  icon: Icon,
  label,
  note,
  last,
}: {
  icon: typeof Mail;
  label: string;
  note: string;
  last?: boolean;
}) {
  return (
    <View
      style={last ? undefined : { borderBottomWidth: 1, borderBottomColor: "#E5E7EB" }}
      className="flex-row items-center gap-3 py-3"
    >
      <View className="h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: "#F3F4F6" }}>
        <Icon size={15} color={MUTED} />
      </View>
      <View className="flex-1">
        <Text className="text-[14px]" style={{ color: INK, fontWeight: "600" }} numberOfLines={1}>
          {label}
        </Text>
        <Text className="text-[11px]" style={{ color: MUTED }}>
          {note}
        </Text>
      </View>
    </View>
  );
}
