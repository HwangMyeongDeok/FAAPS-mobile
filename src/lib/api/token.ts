/**
 * Session token accessor.
 *
 * Lives in its own module so that service files can attach the
 * `Authorization: Bearer <token>` header without importing the auth store
 * (which would create a circular dependency: store → api/auth → store).
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

import type { AuthSession } from "@/types";

/** AsyncStorage key for the persisted session object. */
export const SESSIONS_KEY = "faaps.auth.session";

/** Read the persisted session (null when signed out). */
export async function readSession(): Promise<AuthSession | null> {
  try {
    const raw = await AsyncStorage.getItem(SESSIONS_KEY);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
}

/** Read just the bearer token, ready to hand to the `http` wrapper. */
export async function getAuthToken(): Promise<string | null> {
  const session = await readSession();
  return session?.token ?? null;
}
