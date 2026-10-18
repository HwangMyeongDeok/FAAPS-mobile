import { Redirect } from "expo-router";

import { useAuthStore } from "@/stores/auth";

export default function Index() {
  const status = useAuthStore((s) => s.status);

  if (status === "unknown") return null;
  return status === "authenticated"
    ? <Redirect href="/(app)" />
    : <Redirect href="/(auth)/sign-in" />;
}
