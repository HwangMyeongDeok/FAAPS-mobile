import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useUnreadCount } from "@/lib/queries/notifications";

/**
 * The permanent destinations.
 *
 * `notifications` is a tab (not a pushed screen) so the bottom bar can
 * carry the unread badge. The old `/(app)/notifications` path still works —
 * it redirects to this tab from `app/(app)/_layout.tsx`.
 */
export default function TabsLayout() {
  // Polls every 30s while the app is in the foreground; the count is shared
  // with the home screen, so both badges stay in sync from one query.
  const { data: unreadCount = 0 } = useUnreadCount();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#F37021",
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
        name="notifications"
        options={{
          title: "Alerts",
          tabBarBadge: unreadCount > 0 ? (unreadCount > 99 ? "99+" : unreadCount) : undefined,
          tabBarBadgeStyle: {
            backgroundColor: "#F37021",
            color: "#FFFFFF",
            fontSize: 10,
            fontWeight: "700",
            minWidth: 18,
            lineHeight: 16,
          },
          tabBarAccessibilityLabel:
            unreadCount > 0
              ? `Alerts, ${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
              : "Alerts",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="bell-outline" size={24} color={color as string} />
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
