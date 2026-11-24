/**
 * Bridges React Native's `AppState` into TanStack Query's `focusManager`.
 *
 * Why this is needed:
 *
 * · On the web, TanStack Query already knows when the tab is hidden — it
 *   reads `document.visibilityState`. React Native has no `document`, so
 *   `focusManager.isFocused()` always answered `true`, and any query with
 *   `refetchInterval` kept polling forever, even with the app minimised.
 * · `refetchIntervalInBackground` defaults to `false`, so the interval
 *   callback checks `focusManager.isFocused()` before it refetches.
 *   Feeding the real foreground state in is what makes that check mean
 *   something on native.
 *
 * So: `active` → focused → polling resumes; `background` / `inactive` →
 * unfocused → polling pauses and the phone's battery is spared.
 *
 * Must be mounted once, above the `QueryClientProvider`, so the listener
 * outlives any single screen. See `app/_layout.tsx`.
 */
import { useEffect } from "react";
import { AppState } from "react-native";
import { focusManager } from "@tanstack/react-query";

export function useAppFocusManager() {
  useEffect(() => {
    // Sync the current state first: `AppState.currentState` can be `null`
    // for a moment on the legacy architecture, so fall back to "focused"
    // until the native side reports something concrete.
    focusManager.setFocused(AppState.currentState !== "background");

    const subscription = AppState.addEventListener("change", (state) => {
      focusManager.setFocused(state === "active");
    });

    return () => {
      subscription.remove();
      // Hand focus control back to the default (document visibility) so a
      // remount does not inherit a stale "unfocused" value.
      focusManager.setFocused(undefined);
    };
  }, []);
}
