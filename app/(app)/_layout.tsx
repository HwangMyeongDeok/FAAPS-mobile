import { Tabs } from "expo-router";
import { BookOpen, House, User2 } from "lucide-react-native";

import { useAuthStore } from "@/stores/auth";

export default function AppLayout() {
  const status = useAuthStore((s) => s.status);
  if (status !== "authenticated") return null;

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
          tabBarIcon: (props) => <House {...(props as any)} />,
        }}
      />
      <Tabs.Screen
        name="curriculum"
        options={{
          title: "Chương trình",
          tabBarIcon: (props) => <BookOpen {...(props as any)} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Hồ sơ",
          tabBarIcon: (props) => <User2 {...(props as any)} />,
        }}
      />
    </Tabs>
  );
}
