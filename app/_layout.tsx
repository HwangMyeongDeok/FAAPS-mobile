import "../global.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useAuthStore } from "@/stores/auth";

export default function RootLayout() {
  // Boot the auth store from persistent storage on first mount.
  const hydrate = useAuthStore((s) => s.hydrate);
  const status = useAuthStore((s) => s.status);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 30_000,
          },
        },
      }),
    [],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        {status === "unknown" ? (
          // Wait for the persisted session to be restored before deciding
          // where to route — show a spinner instead of a blank screen.
          <View className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-900">
            <ActivityIndicator color="#F36F21" size="large" />
          </View>
        ) : (
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(app)" />
          </Stack>
        )}
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
