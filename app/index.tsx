import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { useAuthStore } from "@/stores/auth";

export default function Index() {
  const status = useAuthStore((s) => s.status);

  if (status === "unknown") {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="hsl(20 90% 53%)" />
      </View>
    );
  }

  return status === "authenticated"
    ? <Redirect href="/(app)" />
    : <Redirect href="/(auth)/sign-in" />;
}