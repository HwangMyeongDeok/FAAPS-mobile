/**
 * Runtime config resolved from Expo constants + environment variables.
 *
 * The app talks to the real FAAPS backend only — there is no mock mode any
 * more. Point it at a running backend with either:
 *
 *   • `extra.apiBaseUrl` in app.json (committed default)
 *   • `EXPO_PUBLIC_API_BASE_URL` in .env (takes precedence)
 *
 * On the Android emulator the host machine is reachable at 10.0.2.2, so the
 * default there is `http://10.0.2.2:8080`; on iOS / web `localhost` works.
 */
import Constants from "expo-constants";
import { Platform } from "react-native";

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, unknown>;

const DEFAULT_BASE_URL =
  Platform.OS === "android" ? "http://10.0.2.2:8080" : "http://localhost:8080";

/** Base URL of the FAAPS backend. */
export const apiBaseUrl =
  (process.env.EXPO_PUBLIC_API_BASE_URL as string | undefined) ||
  (extra.apiBaseUrl as string | undefined) ||
  DEFAULT_BASE_URL;

export const config = {
  /** Base URL of the real FAAPS backend. */
  apiBaseUrl,
  /** Request timeout in ms. */
  requestTimeoutMs: 20_000,
  /** Timeout for the long-running AI generation calls. */
  aiTimeoutMs: 120_000,
} as const;
