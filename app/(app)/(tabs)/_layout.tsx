import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

/**
 * The four permanent destinations. Everything else (advising, notifications)
 * is pushed from a screen above the tab bar — see `app/(app)/_layout.tsx`.
 */
export default function TabsLayout() {
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
          title: "Home",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="home" size={24} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="courses"
        options={{
          title: "Courses",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="book-search" size={24} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="curriculum"
        options={{
          title: "Curriculum",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="book-open" size={24} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="account" size={24} color={color as string} />
          ),
        }}
      />
    </Tabs>
  );
}
