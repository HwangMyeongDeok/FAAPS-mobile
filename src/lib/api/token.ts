/**
 * Session token accessor.
 *
 * The FAAPS backend is session based, so there is no bearer token to store:
 * the session lives in the platform cookie jar. The persisted object below is
 * only a *snapshot* of who is signed in, used to render the UI before the
 * first `/api/auth/me` round-trip resolves.
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

/** Persist the session snapshot. */
export async function writeSession(session: AuthSession): Promise<void> {
  try {
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(session));
  } catch {
    /* storage is best-effort */
  }
}

/** Drop the persisted session. */
export async function clearSession(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SESSIONS_KEY);
  } catch {
    /* storage is best-effort */
  }
}
