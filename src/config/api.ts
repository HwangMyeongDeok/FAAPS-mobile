/**
 * Runtime config resolved from Expo constants.
 *
 * `EXPO_PUBLIC_API_BASE_URL` is set via app.json → extra, or via .env (Expo SDK 50+).
 * If unset, the app runs in **mock mode** (network calls are short-circuited).
 *
 * The flag is exposed publicly so any module can decide whether to use mock data.
 */
import Constants from "expo-constants";

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, unknown>;

export const config = {
  /** Base URL of the real FAAPS backend. Empty string → mock mode. */
  apiBaseUrl: (extra.apiBaseUrl as string | undefined) ?? "",
  /** When true, every API call returns mock data (network disabled). */
  isMockMode: !(extra.apiBaseUrl as string | undefined),
  /** Request timeout in ms. */
  requestTimeoutMs: 15_000,
} as const;