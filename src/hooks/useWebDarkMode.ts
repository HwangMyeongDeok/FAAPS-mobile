import { useEffect, useState } from "react";
import { Appearance, Platform } from "react-native";

/**
 * Keeps the `dark` class on `<html>` in sync with the OS appearance on web.
 *
 * The Tailwind config uses `darkMode: "class"`, which NativeWind compiles
 * to `.dark <variant>` on web — but nothing ever adds that class, so the web
 * build would be stuck in light mode. On native the same `dark:` variants
 * are driven by `Appearance.getColorScheme()` directly, so this hook is a
 * no-op there.
 */
export function useWebDarkMode() {
  // Applied during the first render (not in an effect) so the very first
  // paint already uses the right palette — otherwise the screen flashes
  // light before the class lands.
  useState(() => {
    if (Platform.OS === "web" && typeof document !== "undefined") {
      document.documentElement.classList.toggle(
        "dark",
        Appearance.getColorScheme() === "dark",
      );
    }
    return null;
  });

  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;
    const root = document.documentElement;
    const apply = (scheme: "light" | "dark" | null | undefined) => {
      root.classList.toggle("dark", scheme === "dark");
    };
    const sub = Appearance.addChangeListener(({ colorScheme }) =>
      apply(colorScheme),
    );
    return () => sub.remove();
  }, []);
}
