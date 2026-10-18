import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { useAuthStore } from "@/stores/auth";

export default function SignIn() {
  const signIn = useAuthStore((s) => s.signInWithGoogle);
  const status = useAuthStore((s) => s.status);

  const loading = status === "authenticating";

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900">
      <View className="flex-1 px-6 py-8 justify-between">
        {/* Top — logo + title */}
        <View className="flex-1 items-center justify-center">
          <View className="h-16 w-16 rounded-2xl bg-primary-500 items-center justify-center mb-6">
            <Text className="text-2xl font-bold text-white">F</Text>
          </View>
          <Text className="text-3xl font-bold text-slate-900 dark:text-white text-center">
            FAAPS
          </Text>
          <Text className="text-base text-slate-500 text-center mt-2">
            FPT AI Academic Planning System
          </Text>
          <Text className="text-sm text-slate-400 text-center mt-1">
            Dành cho sinh viên FPT Hồ Chí Minh
          </Text>
        </View>

        {/* Bottom — sign-in card */}
        <View>
          <View className="rounded-2xl bg-white dark:bg-slate-800 p-5 border border-slate-100 dark:border-slate-700">
            <Text className="text-base font-semibold text-slate-900 dark:text-white mb-2">
              Đăng nhập bằng Google
            </Text>
            <Text className="text-sm text-slate-500 leading-5 mb-5">
              FAAPS chỉ cho phép đăng nhập bằng tài khoản Google đã được FPT
              cấp quyền. Điều này đảm bảo thông tin của bạn luôn đồng bộ với
              cổng FAP.
            </Text>
            {/* Mock Google button — uses an inline "G" letter instead of the
                bundled icon asset so the layout can never overflow. */}
            <View className="w-full">
              <Button
                label="Sign in with Google"
                variant="primary"
                onPress={() => signIn()}
                loading={loading}
              />
            </View>
          </View>
          <Text className="text-center text-xs text-slate-400 mt-4">
            Bằng việc tiếp tục, bạn đồng ý với quy chế sử dụng của FAAPS.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
