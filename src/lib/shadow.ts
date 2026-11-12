import type { ViewStyle } from "react-native";

/**
 * Shared rest-state shadows (taste skill: a resting card gets at most a
 * small blur under 8% black; real shadows are for what floats).
 *
 * iOS reads `shadow*`, Android reads `elevation` — both are set so the
 * depth renders on either platform.
 */
export function cardShadow(isDark: boolean): ViewStyle {
  return {
    shadowColor: "#000",
    shadowOpacity: isDark ? 0.22 : 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  };
}

/** Floating layers: sheets, toasts, menus, dialogs. */
export function floatShadow(): ViewStyle {
  return {
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  };
}
