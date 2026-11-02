import { Redirect, Stack } from "expo-router";

import { useAuthStore } from "@/stores/auth";

/**
 * FE-S-10 · FE-S-8 — screens that live above the tab bar.
 *
 * Why a Stack here instead of extra tabs: Expo Router v58 filters tab items
 * down to the visible ones and *redirects* any focused route that has no
 * visible tab trigger (see `useVisibleTabsWithRedirect`). Pushing to a
 * `href: null` tab would bounce the user straight back to the first tab.
 * A Stack sibling keeps these routes pushable and keeps the bottom bar to
 * the four destinations that earn a permanent place.
 */
export default function AppLayout() {
  const status = useAuthStore((s) => s.status);

  // Auth guard — redirect instead of rendering `null` (which showed a blank
  // white screen when deep-linking into a protected route while signed out).
  if (status === "unknown") return null;
  if (status !== "authenticated") return <Redirect href="/(auth)/sign-in" />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: "transparent" },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="study-plan" />
      <Stack.Screen name="transcript" />
      <Stack.Screen name="advising" />
      <Stack.Screen name="appointments" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="ai-chat" />
      <Stack.Screen name="ai-roadmap" />
    </Stack>
  );
}
