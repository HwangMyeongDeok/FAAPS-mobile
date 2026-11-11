/**
 * Runtime config resolved from Expo constants + environment variables.
 *
 * The app talks to the real FAAPS backend only — there is no mock mode any
 * more. Point it at a running backend with either:
 *
 *   • `EXPO_PUBLIC_API_BASE_URL` in `.env` / `.env.local` (takes precedence)
 *   • `extra.apiBaseUrl` in app.json (committed fallback)
 *   • the built-in default below (emulator / simulator only)
 *
 * On the Android emulator the host machine is reachable at 10.0.2.2, so the
 * default there is `http://10.0.2.2:8080`; on iOS / web `localhost` works.
 *
 * ⚠️ A physical device can never reach `localhost` — it points at the phone
 * itself. Use the computer's LAN IP (`ipconfig` → IPv4) instead.
 */
import Constants from "expo-constants";
import { Platform } from "react-native";

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, unknown>;

const DEFAULT_BASE_URL =
  Platform.OS === "android" ? "http://10.0.2.2:8080" : "http://localhost:8080";

/**
 * Normalise a base URL so that a trailing `/api` is not duplicated.
 *
 * Every service path in `src/lib/api/*` already starts with `/api`
 * (e.g. `/api/student/profile`) and `buildUrl()` in `src/lib/http.ts`
 * concatenates base + path. So a base of `http://host:8080/api` would
 * produce `http://host:8080/api/api/student/profile` → 404.
 *
 * Stripping the trailing `/api` makes both of these work:
 *   http://192.168.1.219:8080
 *   http://192.168.1.219:8080/api
 *
 * The result never ends with a slash, so `buildUrl()` can concatenate
 * safely.
 */
function normalizeBaseUrl(raw: string): string {
  let url = raw.trim();

  // Drop a trailing slash — `http://host:8080/` → `http://host:8080`.
  url = url.replace(/\/+$/, "");

  // Drop a trailing `/api` segment — the service paths already carry it.
  url = url.replace(/\/api$/i, "");

  return url;
}

/** The raw, un-normalised value from every source, in priority order. */
const rawBaseUrl =
  (process.env.EXPO_PUBLIC_API_BASE_URL as string | undefined) ||
  (extra.apiBaseUrl as string | undefined) ||
  DEFAULT_BASE_URL;

/**
 * Base URL of the FAAPS backend — normalised, without a trailing slash and
 * without a trailing `/api` (see `normalizeBaseUrl`).
 */
export const apiBaseUrl = normalizeBaseUrl(rawBaseUrl);

/**
 * True when the base URL still points at a loopback address. On a physical
 * device that means the app cannot reach the backend, so the UI can warn
 * about it instead of failing silently on every request.
 */
export const isLoopbackBaseUrl =
  /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:|\/|$)/i.test(apiBaseUrl);

export const config = {
  /** Base URL of the real FAAPS backend. */
  apiBaseUrl,
  /** Request timeout in ms. */
  requestTimeoutMs: 20_000,
  /** Timeout for the long-running AI generation calls. */
  aiTimeoutMs: 120_000,
} as const;
