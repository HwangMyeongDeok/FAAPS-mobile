import { LogIn, Sparkles } from "lucide-react-native";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Badge, Button } from "@/components/ui";
import { useAuthStore } from "@/stores/auth";
import { config } from "@/config/api";

export default function SignIn() {
  const signIn = useAuthStore((s) => s.signInWithGoogle);
  const status = useAuthStore((s) => s.status);
  const loading = status === "authenticating";

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-6 py-8 justify-between">
        {/* Top — branding */}
        <View className="flex-1 items-center justify-center">
          <View className="h-20 w-20 rounded-2xl bg-primary items-center justify-center mb-6 shadow-lg">
            <Text className="text-3xl font-bold text-white">F</Text>
          </View>
          <Text className="text-3xl font-bold text-foreground text-center">
            FAAPS
          </Text>
          <Text className="text-base text-muted-foreground text-center mt-2">
            FPT AI Academic Planning System
          </Text>
          <Text className="text-sm text-muted-foreground/80 text-center mt-1">
            Dành cho sinh viên FPT Hồ Chí Minh
          </Text>

          {/* Feature pills */}
          <View className="flex-row flex-wrap items-center justify-center gap-2 mt-6">
            <Badge variant="secondary">
              <View className="flex-row items-center gap-1">
                <Sparkles size={12} color="hsl(222.2 47.4% 11.2%)" />
                <Text>AI kế hoạch học tập</Text>
              </View>
            </Badge>
            <Badge variant="secondary">Tư vấn 1-1</Badge>
            <Badge variant="secondary">Theo dõi GPA</Badge>
          </View>

          {config.isMockMode && (
            <View className="mt-4 px-3 py-1 rounded-full bg-amber-100">
              <Text className="text-xs font-medium text-amber-800">
                🛠 Mock mode — không có backend thật
              </Text>
            </View>
          )}
        </View>

        {/* Bottom — sign-in card */}
        <View>
          <View className="rounded-2xl bg-card border border-border p-5">
            <Text className="text-base font-semibold text-foreground mb-2">
              Đăng nhập bằng Google
            </Text>
            <Text className="text-sm text-muted-foreground leading-5 mb-5">
              FAAPS chỉ cho phép đăng nhập bằng tài khoản Google đã được FPT
              cấp quyền. Điều này đảm bảo thông tin của bạn luôn đồng bộ với
              cổng FAP.
            </Text>
            <Button
              label="Sign in with Google"
              variant="primary"
              size="lg"
              loading={loading}
              leftIcon={<LogIn size={18} color="#fff" />}
              onPress={() => signIn()}
            />
          </View>
          <Text className="text-center text-xs text-muted-foreground mt-4">
            Bằng việc tiếp tục, bạn đồng ý với quy chế sử dụng của FAAPS.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}