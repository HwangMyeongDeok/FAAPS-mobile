import { Redirect, Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useAuthStore } from "@/stores/auth";

export default function AppLayout() {
  const status = useAuthStore((s) => s.status);

  // Auth guard — redirect instead of rendering `null` (which showed a blank
  // white screen when deep-linking into a protected route while signed out).
  if (status === "unknown") return null;
  if (status !== "authenticated") return <Redirect href="/(auth)/sign-in" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#F36F21",
        tabBarInactiveTintColor: "#64748B",
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: "#E2E8F0",
          backgroundColor: "white",
          height: 64,
          paddingTop: 6,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Trang chủ",
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="home" size={24} color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="courses"
        options={{
          title: "Môn học",
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="book-search" size={24} color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="curriculum"
        options={{
          title: "Chương trình",
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="book-open" size={24} color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Hồ sơ",
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="account" size={24} color={color as string} />,
        }}
      />
    </Tabs>
  );
}
