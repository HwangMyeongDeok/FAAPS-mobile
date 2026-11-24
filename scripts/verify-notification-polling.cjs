/**
 * Manual sanity check for the notification polling behaviour.
 *
 * Run with: node scripts/verify-notification-polling.cjs
 *
 * It proves two things:
 *   1. while the app is "in the foreground" the unread-count query refetches
 *      on the 30s interval;
 *   2. once the app goes to the background the refetches stop, and they pick
 *      up again as soon as the app becomes active again.
 *
 * The AppState bridge itself lives in `src/hooks/useAppFocusManager.ts`;
 * this script reproduces what it does to TanStack Query's focusManager.
 */
const { focusManager, QueryClient, QueryObserver, environmentManager } = require("@tanstack/react-query");

// TanStack Query treats a runtime without `window` as a server, and a server
// never schedules refetch timers. React Native does define a global `window`,
// so on device this is a client — the override below reproduces that here so
// the script can exercise the polling logic.
environmentManager.setIsServer(() => false);

const POLL_INTERVAL = 50; // stands in for the real 30_000 ms
const qc = new QueryClient();
let calls = 0;

const observer = new QueryObserver(qc, {
  queryKey: ["notifications", "unread-count"],
  queryFn: async () => {
    calls += 1;
    return calls;
  },
  staleTime: 0,
  refetchInterval: POLL_INTERVAL,
  refetchIntervalInBackground: false,
});

const unsubscribe = observer.subscribe(() => {});

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  await wait(POLL_INTERVAL * 3);
  const whileActive = calls;
  console.log(`foreground  -> ${whileActive} fetch(es)`);
  if (whileActive < 2) {
    console.error("FAIL: the query did not poll while the app was active");
    process.exit(1);
  }

  // The app goes to the background: `useAppFocusManager` calls
  // focusManager.setFocused(false).
  focusManager.setFocused(false);
  await wait(POLL_INTERVAL * 3);
  const whileBackground = calls;
  console.log(`background  -> ${whileBackground} fetch(es) (no new ones expected)`);
  if (whileBackground !== whileActive) {
    console.error("FAIL: the query kept polling while the app was in the background");
    process.exit(1);
  }

  // The app comes back to the foreground.
  focusManager.setFocused(true);
  await wait(POLL_INTERVAL * 3);
  const afterResume = calls;
  console.log(`active again -> ${afterResume} fetch(es)`);
  if (afterResume <= whileBackground) {
    console.error("FAIL: the query did not resume polling when the app became active");
    process.exit(1);
  }

  unsubscribe();
  console.log("\nOK: polling runs in the foreground, pauses in the background, resumes on active.");
  process.exit(0);
})();
