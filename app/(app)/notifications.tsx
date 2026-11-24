/**
 * Compatibility shim for the old `/(app)/notifications` path.
 *
 * The notification centre now lives in the bottom navigation
 * (`/(app)/(tabs)/notifications`) so it can carry the unread badge. Backend
 * deep links and in-app `router.push("/(app)/notifications")` calls still
 * point at the old path, so this route forwards to the tab.
 */
import { Redirect } from "expo-router";

export default function NotificationsRedirect() {
  return <Redirect href="/(app)/(tabs)/notifications" />;
}
