/**
 * Runtime config resolved from Expo constants + environment variables.
 *
 * ── MOCK-FIRST STRATEGY ──────────────────────────────────────────────────────
 * The app runs entirely on mock data by default. To switch to the real
 * backend you only have to flip ONE of these:
 *
 *   • Set `extra.isMockMode: false` in app.json  (recommended — committed)
 *   • Or set `EXPO_PUBLIC_MOCK_MODE=false` in .env
 *
 * Once `isMockMode` is false, `apiBaseUrl` must point to a reachable backend
 * and every service in `src/lib/api/*` will call the real HTTP wrapper.
 *
 * Precedence: `EXPO_PUBLIC_MOCK_MODE` (env) > `extra.isMockMode` (app.json) > default (true).
 */
import Constants from "expo-constants";

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, unknown>;

/** Base URL of the real FAAPS backend. Empty string → mock mode. */
const apiBaseUrl =
  (extra.apiBaseUrl as string | undefined) ||
  (process.env.EXPO_PUBLIC_API_BASE_URL as string | undefined) ||
  "";

/**
 * Mock mode is driven by an explicit flag, so wiring the backend later is a
 * one-line change and never silently depends on whether a URL happens to be set.
 */
const envMockMode = process.env.EXPO_PUBLIC_MOCK_MODE;
const isMockMode =
  envMockMode !== undefined
    ? envMockMode !== "false"
    : typeof extra.isMockMode === "boolean"
      ? extra.isMockMode
      : true;

export const config = {
  /** Base URL of the real FAAPS backend. Empty string → mock mode. */
  apiBaseUrl,
  /** When true, every API call returns mock data (network disabled). */
  isMockMode,
  /** Request timeout in ms (real mode only). */
  requestTimeoutMs: 15_000,
} as const;

/** Convenience helper — true when the app should hit the real backend. */
export const isRealApi = !config.isMockMode;
