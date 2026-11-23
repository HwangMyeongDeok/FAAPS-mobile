/**
 * Register — create a student account.
 *
 * Uses the Zod schema `registerSchema` (src/modules/auth/schemas) and the
 * public backend endpoints:
 *   GET  /api/auth/register/curriculums  → the dropdown options
 *   POST /api/auth/register               → creates the account + session
 *
 * On success the app returns to sign-in with a toast.
 *
 * DESIGN:
 * - Nền #FAFAFA, text #1A1A1A / #6B7280, accent cam FPT #F37021.
 * - Card trắng bo góc 16px, shadow 0 1px 3px rgba(0,0,0,0.05).
 * - Input bo góc 12px, button bo góc 12px cao 48px font 600 full-width.
 * - Icon lucide-react-native. Không gradient, không neon, nhiều whitespace.
 */
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { AlertCircle, ArrowLeft, Check, Mail, Phone, User } from "lucide-react-native";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getRegisterCurriculums, registerStudent } from "@/lib/api/registration";
import { registerSchema, type RegisterInput } from "@/modules/auth/schemas";
import { CurriculumSelect } from "@/modules/auth/components/CurriculumSelect";

const FPT_ORANGE = "#F37021";
const INK = "#1A1A1A";
const MUTED = "#6B7280";
const DANGER = "#EF4444";
const SUCCESS = "#10B981";

type RegisterForm = RegisterInput;

/** One text field with a leading icon and an inline error message. */
function Field({
  label,
  icon,
  error,
  ...inputProps
}: {
  label: string;
  icon: React.ReactNode;
  error?: string;
} & React.ComponentProps<typeof TextInput>) {
  const [focused, setFocused] = useState(false);
  return (
    <View>
      <Text className="mb-1.5 text-[13px]" style={{ color: INK, fontWeight: "600" }}>
        {label}
      </Text>
      <View
        className="flex-row items-center px-3.5"
        style={{
          minHeight: 48,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: error ? DANGER : focused ? FPT_ORANGE : "#E5E0D8",
          backgroundColor: "#FFFFFF",
        }}
      >
        <View className="mr-2.5">{icon}</View>
        <TextInput
          {...inputProps}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholderTextColor={MUTED}
          className="flex-1 text-[14px]"
          style={{ color: INK }}
        />
      </View>
      {error ? (
        <View className="mt-1 flex-row items-center gap-1.5">
          <AlertCircle size={13} color={DANGER} />
          <Text className="text-[12px]" style={{ color: DANGER }}>
            {error}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export default function RegisterScreen() {
  const router = useRouter();

  const { data: curriculums = [], isLoading: loadingCurriculums } = useQuery({
    queryKey: ["register", "curriculums"],
    queryFn: getRegisterCurriculums,
    staleTime: 5 * 60_000,
    retry: 1,
  });

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      studentCode: "",
      phone: "",
      dateOfBirth: "",
      curriculumVersionId: undefined,
    },
  });

  // `useWatch` thay cho `watch()`: `watch()` trả về hàm không memoizable nên
  // React Compiler bỏ qua memoization của component này.
  const curriculumVersionId = useWatch({
    control,
    name: "curriculumVersionId",
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      await registerStudent({
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        password: values.password,
        studentCode: values.studentCode.trim(),
        phone: values.phone.trim(),
        dateOfBirth: values.dateOfBirth,
        curriculumVersionId: values.curriculumVersionId,
      });

      setDone(true);
      Alert.alert(
        "Đăng ký thành công",
        "Tài khoản của bạn đã được tạo. Hãy đăng nhập để bắt đầu.",
        [{ text: "Đăng nhập", onPress: () => router.replace("/(auth)/sign-in") }],
      );
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Không thể tạo tài khoản. Vui lòng thử lại.",
      );
    }
  });

  // `handleSubmit` trả về hàm nhận event của form; `Pressable.onPress` nhận
  // event của touch — bọc lại để hai kiểu event không lẫn vào nhau.
  const onPressSubmit = () => {
    void onSubmit();
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: "#FAFAFA" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className="px-5 pb-2 pt-4">
            <Pressable
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Quay lại"
              hitSlop={10}
              className="h-10 w-10 items-center justify-center rounded-full active:opacity-70"
              style={{ backgroundColor: "#F3F4F6" }}
            >
              <ArrowLeft size={20} color={INK} />
            </Pressable>

            <Text
              accessibilityRole="header"
              className="mt-4 text-[26px]"
              style={{ color: INK, fontWeight: "700" }}
            >
              Tạo tài khoản
            </Text>
            <Text className="mt-1.5 text-[14px] leading-5" style={{ color: MUTED }}>
              Dùng tài khoản FPT được cấp để đăng ký học phần và theo dõi
              tiến độ học tập.
            </Text>
          </View>

          {/* Card */}
          <View
            className="mx-5 mt-5 px-5 py-5"
            style={{
              borderRadius: 16,
              backgroundColor: "#FFFFFF",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 3,
              elevation: 1,
            }}
          >
            <View className="gap-4">
              <Controller
                control={control}
                name="fullName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Field
                    label="Họ và tên"
                    icon={<User size={17} color={MUTED} />}
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    placeholder="Nguyễn Văn A"
                    autoCapitalize="words"
                    error={errors.fullName?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Field
                    label="Email FPT"
                    icon={<Mail size={17} color={MUTED} />}
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    placeholder="student@fpt.edu.vn"
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    error={errors.email?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="studentCode"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Field
                    label="Mã sinh viên"
                    icon={<Check size={17} color={MUTED} />}
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    placeholder="SE123456"
                    autoCapitalize="characters"
                    autoCorrect={false}
                    error={errors.studentCode?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Field
                    label="Số điện thoại"
                    icon={<Phone size={17} color={MUTED} />}
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    placeholder="09xxxxxxxx"
                    keyboardType="phone-pad"
                    error={errors.phone?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="dateOfBirth"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Field
                    label="Ngày sinh"
                    icon={<Check size={17} color={MUTED} />}
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    placeholder="YYYY-MM-DD"
                    autoCapitalize="none"
                    autoCorrect={false}
                    error={errors.dateOfBirth?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Field
                    label="Mật khẩu"
                    icon={<Check size={17} color={MUTED} />}
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    placeholder="Ít nhất 8 ký tự"
                    secureTextEntry
                    autoCapitalize="none"
                    error={errors.password?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Field
                    label="Xác nhận mật khẩu"
                    icon={<Check size={17} color={MUTED} />}
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    placeholder="Nhập lại mật khẩu"
                    secureTextEntry
                    autoCapitalize="none"
                    error={errors.confirmPassword?.message}
                  />
                )}
              />

              <View>
                <Text
                  className="mb-1.5 text-[13px]"
                  style={{ color: INK, fontWeight: "600" }}
                >
                  Chương trình đào tạo
                </Text>
                <Controller
                  control={control}
                  name="curriculumVersionId"
                  render={({ field: { onChange } }) => (
                    <CurriculumSelect
                      curriculums={curriculums}
                      value={curriculumVersionId ?? null}
                      onChange={onChange}
                      loading={loadingCurriculums}
                    />
                  )}
                />
              </View>
            </View>

            {submitError ? (
              <View
                className="mt-4 flex-row items-start gap-2 px-3.5 py-3"
                style={{
                  borderRadius: 12,
                  backgroundColor: "#FEF2F2",
                  borderWidth: 1,
                  borderColor: "#FECACA",
                }}
              >
                <AlertCircle size={16} color={DANGER} style={{ marginTop: 1 }} />
                <Text className="flex-1 text-[12px] leading-4" style={{ color: DANGER }}>
                  {submitError}
                </Text>
              </View>
            ) : null}

            {/* Nút submit — cam full-width, bo 12px, cao 48px, font 600 */}
            <Pressable
              onPress={onPressSubmit}
              disabled={isSubmitting || done}
              accessibilityRole="button"
              accessibilityLabel="Tạo tài khoản"
              className="mt-5 flex-row items-center justify-center gap-2 active:opacity-85"
              style={{
                height: 48,
                borderRadius: 12,
                backgroundColor: FPT_ORANGE,
                opacity: isSubmitting || done ? 0.6 : 1,
              }}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text className="text-[15px]" style={{ color: "#FFFFFF", fontWeight: "600" }}>
                  Tạo tài khoản
                </Text>
              )}
            </Pressable>

            {/* Google OAuth — chưa có backend, disable + ghi chú */}
            <Pressable
              disabled
              accessibilityRole="button"
              accessibilityLabel="Đăng ký bằng Google, sắp ra mắt"
              className="mt-3 flex-row items-center justify-center gap-2"
              style={{
                height: 48,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#E5E0D8",
                backgroundColor: "#FFFFFF",
                opacity: 0.6,
              }}
            >
              <Text className="text-[15px]" style={{ color: MUTED, fontWeight: "600" }}>
                Đăng ký bằng Google
              </Text>
              <View
                className="rounded-full px-2 py-0.5"
                style={{ backgroundColor: "#F3F4F6" }}
              >
                <Text className="text-[10px]" style={{ color: MUTED, fontWeight: "600" }}>
                  Sắp ra mắt
                </Text>
              </View>
            </Pressable>

            <Text
              className="mt-2 text-center text-[11px]"
              style={{ color: MUTED }}
            >
              Đăng nhập bằng Google sẽ khả dụng sau.
            </Text>
          </View>

          {/* Link về sign-in */}
          <View className="mt-6 flex-row items-center justify-center gap-1.5">
            <Text className="text-[13px]" style={{ color: MUTED }}>
              Đã có tài khoản?
            </Text>
            <Pressable
              onPress={() => router.replace("/(auth)/sign-in")}
              accessibilityRole="link"
              accessibilityLabel="Đăng nhập"
              hitSlop={8}
            >
              <Text className="text-[13px]" style={{ color: FPT_ORANGE, fontWeight: "600" }}>
                Đăng nhập
              </Text>
            </Pressable>
          </View>

          {done ? (
            <Text
              className="mt-4 text-center text-[12px]"
              style={{ color: SUCCESS, fontWeight: "600" }}
            >
              Tài khoản đã được tạo — đăng nhập để tiếp tục.
            </Text>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
