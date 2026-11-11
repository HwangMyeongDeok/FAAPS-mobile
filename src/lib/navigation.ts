/**
 * Safe navigation for server-provided URLs.
 *
 * The backend hands the app a deep link inside every notification
 * (`AppNotification.actionUrl`). That string is data we do not control, so
 * it must never be pushed straight into `router.push()`: an unmatched route
 * throws inside the router and takes the screen down with it.
 *
 * So every server-supplied URL goes through `resolveServerRoute()` first:
 *   • a known app route (`/(app)/transcript`) passes through untouched;
 *   • a known backend path (`/student/transcript`) is translated into the
 *     app route that shows the same thing;
 *   • anything else is rejected, and the caller shows a toast instead of
 *     navigating.
 *
 * Nothing here ever opens an external URL — the notification links are
 * meant to stay inside the app.
 */

/**
 * Every route the app can actually show.
 *
 * Kept in sync with the files under `app/`: the four tabs plus the seven
 * screens pushed above the tab bar.
 */
export const APP_ROUTES = [
  "/(app)",
  "/(app)/(tabs)",
  "/(app)/(tabs)/index",
  "/(app)/(tabs)/courses",
  "/(app)/(tabs)/curriculum",
  "/(app)/(tabs)/profile",
  "/(app)/study-plan",
  "/(app)/transcript",
  "/(app)/advising",
  "/(app)/appointments",
  "/(app)/notifications",
  "/(app)/ai-chat",
  "/(app)/ai-roadmap",
] as const;

const APP_ROUTE_SET: ReadonlySet<string> = new Set(APP_ROUTES);

interface RouteRule {
  /** Matches the path part of the incoming URL (query/hash already removed). */
  readonly pattern: RegExp;
  /** The app route to navigate to. */
  readonly href: string;
  /**
   * When set, the first capture group is appended to the app route as a
   * query parameter with this name. Used for the advising deep link, which
   * opens a specific conversation.
   */
  readonly paramName?: string;
}

/**
 * Backend paths → app routes.
 *
 * The patterns deliberately allow a trailing segment (`/student/transcript/12`)
 * because the backend often appends the record id.
 */
const BACKEND_ROUTE_RULES: readonly RouteRule[] = [
  // Transcript & academic progress
  { pattern: /^\/student\/transcript(?:\/.*)?$/i, href: "/(app)/transcript" },
  { pattern: /^\/student\/progress(?:\/.*)?$/i, href: "/(app)/transcript" },
  { pattern: /^\/transcript(?:\/.*)?$/i, href: "/(app)/transcript" },

  // Study plan
  {
    pattern: /^\/student\/study[-_]?plans?(?:\/.*)?$/i,
    href: "/(app)/study-plan",
  },
  { pattern: /^\/student\/plan(?:\/.*)?$/i, href: "/(app)/study-plan" },
  { pattern: /^\/study[-_]?plan(?:\/.*)?$/i, href: "/(app)/study-plan" },

  // Advising — the trailing id becomes `?conversation=<id>`
  {
    pattern: /^\/student\/advising[-_]?requests?(?:\/([^/?#]+))?$/i,
    href: "/(app)/advising",
    paramName: "conversation",
  },
  {
    pattern: /^\/advising(?:\/([^/?#]+))?$/i,
    href: "/(app)/advising",
    paramName: "conversation",
  },
  { pattern: /^\/student\/advising(?:\/.*)?$/i, href: "/(app)/advising" },

  // Appointments
  { pattern: /^\/student\/appointments?(?:\/.*)?$/i, href: "/(app)/appointments" },
  { pattern: /^\/appointments?(?:\/.*)?$/i, href: "/(app)/appointments" },

  // Catalogue & curriculum
  { pattern: /^\/student\/courses?(?:\/.*)?$/i, href: "/(app)/(tabs)/courses" },
  { pattern: /^\/courses?(?:\/.*)?$/i, href: "/(app)/(tabs)/courses" },
  {
    pattern: /^\/student\/curriculums?(?:\/.*)?$/i,
    href: "/(app)/(tabs)/curriculum",
  },
  { pattern: /^\/curriculums?(?:\/.*)?$/i, href: "/(app)/(tabs)/curriculum" },

  // Profile
  { pattern: /^\/student\/profiles?(?:\/.*)?$/i, href: "/(app)/(tabs)/profile" },
  { pattern: /^\/profiles?(?:\/.*)?$/i, href: "/(app)/(tabs)/profile" },

  // Notifications
  {
    pattern: /^\/student\/notifications?(?:\/.*)?$/i,
    href: "/(app)/notifications",
  },
  { pattern: /^\/notifications?(?:\/.*)?$/i, href: "/(app)/notifications" },

  // AI assistant & roadmap
  { pattern: /^\/student\/ai\/roadmap(?:\/.*)?$/i, href: "/(app)/ai-roadmap" },
  { pattern: /^\/ai\/roadmap(?:\/.*)?$/i, href: "/(app)/ai-roadmap" },
  { pattern: /^\/roadmap(?:\/.*)?$/i, href: "/(app)/ai-roadmap" },
  { pattern: /^\/student\/ai\/chat(?:\/.*)?$/i, href: "/(app)/ai-chat" },
  { pattern: /^\/ai\/chat(?:\/.*)?$/i, href: "/(app)/ai-chat" },
  { pattern: /^\/student\/ai(?:\/.*)?$/i, href: "/(app)/ai-chat" },
  { pattern: /^\/ai(?:\/.*)?$/i, href: "/(app)/ai-chat" },

  // Home
  { pattern: /^\/student$/i, href: "/(app)/(tabs)" },
  { pattern: /^\/home(?:\/.*)?$/i, href: "/(app)/(tabs)" },
];

export type RouteResolution =
  | { readonly ok: true; readonly href: string }
  | {
      readonly ok: false;
      readonly reason: "empty" | "unsupported";
      readonly url: string;
    };

/**
 * Split a URL into its path and its query/hash tail.
 */
function splitUrl(url: string): { path: string; tail: string } {
  const cut = url.search(/[?#]/);
  if (cut === -1) return { path: url, tail: "" };
  return { path: url.slice(0, cut), tail: url.slice(cut) };
}

/**
 * Append a query/hash tail to a route that may already carry a query
 * parameter of its own.
 *
 * A tail starting with `#` is a fragment and is appended as-is; anything
 * else is a query string and joins with `&`.
 */
function appendTail(href: string, tail: string): string {
  if (!tail) return href;
  if (tail.startsWith("#")) return `${href}${tail}`;
  return href.includes("?")
    ? `${href}&${tail.slice(1)}`
    : `${href}${tail}`;
}

/**
 * Resolve a server-supplied URL into an app route.
 *
 * Returns `{ ok: true, href }` when the URL points at something the app can
 * show, and `{ ok: false, reason }` otherwise. The caller decides what to do
 * with a rejection — it must never navigate on a rejected URL.
 */
export function resolveServerRoute(url: string | null | undefined): RouteResolution {
  const raw = (url ?? "").trim();

  if (!raw) {
    return { ok: false, reason: "empty", url: raw };
  }

  // An absolute URL to somewhere else on the internet is not an app route.
  // The scheme check also catches `//evil.example.com` (protocol-relative).
  if (/^[a-z][a-z0-9+.-]*:/i.test(raw) || raw.startsWith("//")) {
    return { ok: false, reason: "unsupported", url: raw };
  }

  // Only same-app paths are considered. `actionUrl` is meant to be relative.
  if (!raw.startsWith("/")) {
    return { ok: false, reason: "unsupported", url: raw };
  }

  const { path, tail } = splitUrl(raw);
  // Ignore a trailing slash so `/student/transcript/` matches too.
  const normalizedPath = path.replace(/\/+$/, "") || "/";

  // 1. Already an app route → keep it, but only if we know it.
  if (normalizedPath.startsWith("/(app)")) {
    if (!APP_ROUTE_SET.has(normalizedPath)) {
      return { ok: false, reason: "unsupported", url: raw };
    }
    return { ok: true, href: `${normalizedPath}${tail}` };
  }

  // 2. A backend path → translate it into the app route that shows it.
  for (const rule of BACKEND_ROUTE_RULES) {
    const match = rule.pattern.exec(normalizedPath);
    if (!match) continue;

    let href = rule.href;
    const captured = rule.paramName ? match[1] : undefined;

    // A captured id becomes a query parameter on the app route.
    if (rule.paramName && captured) {
      href = `${href}?${rule.paramName}=${encodeURIComponent(captured)}`;
    }

    // Any query string the original URL carried is preserved.
    href = appendTail(href, tail);

    return { ok: true, href };
  }

  // 3. Anything else is not a route this app knows.
  return { ok: false, reason: "unsupported", url: raw };
}

/** True when the URL resolves to a route the app can show. */
export function isKnownServerRoute(url: string | null | undefined): boolean {
  return resolveServerRoute(url).ok;
}
