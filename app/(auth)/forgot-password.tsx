/**
 * Forgot password — ask the backend to email a reset link.
 *
 * Public endpoint (no session needed):
 *   POST /api/auth/forgot-password  → `{ success, message }`
 *
 * The backend answers with the same generic message whether or not the email
 * exists, so that message is shown verbatim — never a "this email is not
 * registered" hint.
 *
 * DESIGN:
 * - Nền #FAFAFA, text #1A1A1A / #6B7280, accent cam FPT #F37021.
 * - Card trắng bo góc 16px, input bo góc 12px, button bo góc 12px cao 48px.
 * - Icon lucide-react-native. Không gradient, nhiều whitespace.
 */
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { AlertCircle, ArrowLeft, Mail, Send } from "lucide-react-native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { forgotPassword } from "@/lib/api/auth";
import { AuthCard } from "@/modules/auth/components/AuthCard";
import { AuthField } from "@/modules/auth/components/AuthField";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/modules/auth/schemas";

const FPT_ORANGE = "#F37021";
const INK = "#1A1A1A";
const MUTED = "#6B7280";
const DANGER = "#EF4444";
const SUCCESS = "#10B981";

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [sentMessage, setSentMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    setSentMessage(null);
    try {
      const result = await forgotPassword(values.email);
      setSentMessage(result.message);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Không thể gửi yêu cầu. Vui lòng thử lại.",
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
              Quên mật khẩu
            </Text>
            <Text className="mt-1.5 text-[14px] leading-5" style={{ color: MUTED }}>
              Nhập email FPT của bạn. Chúng tôi sẽ gửi một liên kết để bạn đặt
              lại mật khẩu.
            </Text>
          </View>

          <AuthCard title="Gửi liên kết đặt lại mật khẩu">
            {sentMessage ? (
              <View
                className="mb-4 flex-row items-start gap-2 px-3.5 py-3"
                style={{
                  borderRadius: 12,
                  backgroundColor: "#ECFDF5",
                  borderWidth: 1,
                  borderColor: "#A7F3D0",
                }}
              >
                <Text className="flex-1 text-[12px] leading-4" style={{ color: "#047857" }}>
                  {sentMessage}
                </Text>
              </View>
            ) : null}

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <AuthField
                  label="Email FPT"
                  icon={<Mail size={17} color={MUTED} />}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  onSubmitEditing={onPressSubmit}
                  placeholder="student@fpt.edu.vn"
                  keyboardType="email-address"
                  error={errors.email?.message}
                />
              )}
            />

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

            <Pressable
              onPress={onPressSubmit}
              disabled={isSubmitting}
              accessibilityRole="button"
              accessibilityLabel="Gửi liên kết đặt lại mật khẩu"
              className="mt-5 flex-row items-center justify-center gap-2 active:opacity-85"
              style={{
                height: 48,
                borderRadius: 12,
                backgroundColor: FPT_ORANGE,
                opacity: isSubmitting ? 0.6 : 1,
              }}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Send size={17} color="#FFFFFF" />
                  <Text className="text-[15px]" style={{ color: "#FFFFFF", fontWeight: "600" }}>
                    Gửi liên kết
                  </Text>
                </>
              )}
            </Pressable>
          </AuthCard>

          {/* Link về sign-in */}
          <Pressable
            onPress={() => router.replace("/(auth)/sign-in")}
            accessibilityRole="link"
            accessibilityLabel="Quay lại đăng nhập"
            hitSlop={8}
            className="mt-6 items-center"
          >
            <Text className="text-[13px]" style={{ color: FPT_ORANGE, fontWeight: "600" }}>
              Quay lại đăng nhập
            </Text>
          </Pressable>

          {sentMessage ? (
            <Text
              className="mt-4 text-center text-[12px]"
              style={{ color: SUCCESS, fontWeight: "600" }}
            >
              Kiểm tra hộp thư (kể cả thư rác) để lấy liên kết.
            </Text>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
