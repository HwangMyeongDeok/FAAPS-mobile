/**
 * Reset password — set a new password with the token from the reset link.
 *
 * Public endpoint (no session needed):
 *   POST /api/auth/reset-password  → `{ success, message }`
 *
 * The token arrives as a deep-link query parameter (`?token=…`) — the same
 * link the backend emails points at the web app, but the mobile app is
 * registered under the `faaps://` scheme, so an emailed `faaps://` link (or a
 * manual paste of the token) both land here.
 *
 * DESIGN:
 * - Nền #FAFAFA, text #1A1A1A / #6B7280, accent cam FPT #F37021.
 * - Card trắng bo góc 16px, input bo góc 12px, button bo góc 12px cao 48px.
 */
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AlertCircle, ArrowLeft, Check, KeyRound } from "lucide-react-native";
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

import { resetPassword } from "@/lib/api/auth";
import { AuthCard } from "@/modules/auth/components/AuthCard";
import { AuthField } from "@/modules/auth/components/AuthField";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/modules/auth/schemas";

const FPT_ORANGE = "#F37021";
const INK = "#1A1A1A";
const MUTED = "#6B7280";
const DANGER = "#EF4444";
const SUCCESS = "#10B981";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string | string[] }>();

  // The token may arrive as a query param (deep link) — a missing one means
  // the student opened the screen without a link, so it can be pasted in.
  const initialToken = Array.isArray(params.token) ? params.token[0] : params.token;

  const [token, setToken] = useState(initialToken ?? "");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    if (!token.trim()) {
      setSubmitError("Thiếu mã đặt lại mật khẩu. Vui lòng mở lại liên kết trong email.");
      return;
    }
    try {
      await resetPassword(token, values.password);
      setDone(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Không thể đặt lại mật khẩu. Vui lòng thử lại.",
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
              Đặt lại mật khẩu
            </Text>
            <Text className="mt-1.5 text-[14px] leading-5" style={{ color: MUTED }}>
              Chọn một mật khẩu mới cho tài khoản FPT của bạn.
            </Text>
          </View>

          <AuthCard
            title="Mật khẩu mới"
            description="Mật khẩu cần 8–72 ký tự, có ít nhất một chữ cái và một chữ số."
          >
            {done ? (
              <View
                className="mb-4 flex-row items-start gap-2 px-3.5 py-3"
                style={{
                  borderRadius: 12,
                  backgroundColor: "#ECFDF5",
                  borderWidth: 1,
                  borderColor: "#A7F3D0",
                }}
              >
                <Check size={16} color={SUCCESS} style={{ marginTop: 1 }} />
                <Text className="flex-1 text-[12px] leading-4" style={{ color: "#047857" }}>
                  Mật khẩu đã được đặt lại. Hãy đăng nhập với mật khẩu mới.
                </Text>
              </View>
            ) : null}

            {/* Token — chỉ hiện khi deep link không mang theo token. */}
            {!initialToken ? (
              <View className="mb-4">
                <AuthField
                  label="Mã đặt lại mật khẩu"
                  icon={<KeyRound size={17} color={MUTED} />}
                  value={token}
                  onChangeText={setToken}
                  placeholder="Dán mã từ liên kết trong email"
                  autoCapitalize="characters"
                  autoCorrect={false}
                />
                <Text className="mt-1.5 text-[11px]" style={{ color: MUTED }}>
                  Mã này nằm sau `token=` trong liên kết đặt lại mật khẩu.
                </Text>
              </View>
            ) : null}

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <AuthField
                  label="Mật khẩu mới"
                  icon={<KeyRound size={17} color={MUTED} />}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Ít nhất 8 ký tự"
                  secureTextEntry
                  error={errors.password?.message}
                />
              )}
            />

            <View className="mt-4">
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AuthField
                    label="Xác nhận mật khẩu"
                    icon={<Check size={17} color={MUTED} />}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Nhập lại mật khẩu"
                    secureTextEntry
                    error={errors.confirmPassword?.message}
                  />
                )}
              />
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

            {done ? (
              <Pressable
                onPress={() => router.replace("/(auth)/sign-in")}
                accessibilityRole="button"
                accessibilityLabel="Đi tới đăng nhập"
                className="mt-5 flex-row items-center justify-center gap-2 active:opacity-85"
                style={{
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: FPT_ORANGE,
                }}
              >
                <Text className="text-[15px]" style={{ color: "#FFFFFF", fontWeight: "600" }}>
                  Đi tới đăng nhập
                </Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={onPressSubmit}
                disabled={isSubmitting}
                accessibilityRole="button"
                accessibilityLabel="Lưu mật khẩu mới"
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
                  <Text className="text-[15px]" style={{ color: "#FFFFFF", fontWeight: "600" }}>
                    Lưu mật khẩu mới
                  </Text>
                )}
              </Pressable>
            )}
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
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
