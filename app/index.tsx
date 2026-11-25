import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { isRoleSupportedByMobile } from "@/modules/auth";
import { useAuthStore } from "@/stores/auth";

export default function Index() {
  const status = useAuthStore((s) => s.status);
  const role = useAuthStore((s) => s.session?.role);

  if (status === "unknown") {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="hsl(20 90% 53%)" />
      </View>
    );
  }

  if (status === "authenticated") {
    // Defence in depth: the sign-in screen already refuses advisor/admin
    // accounts, but a persisted session could have been written by an
    // older build. Bounce those to the sign-in screen rather than into an
    // app that only renders student data.
    if (!isRoleSupportedByMobile(role)) {
      return <Redirect href="/(auth)/sign-in" />;
    }
    return <Redirect href="/(app)" />;
  }

  return <Redirect href="/(auth)/sign-in" />;
}
