// ============================================================
// Auth store — single source of truth for the signed-in student.
// Uses Zustand + AsyncStorage persistence. Mirrors how a real
// OAuth session would be handled: token + minimal user info on
// the client, profile details fetched server-side.
// ============================================================

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { AuthSession, User } from "@/types";
import { SESSIONS_KEY, signInWithGoogle, signOut } from "@/lib/api/auth";

interface AuthState {
  session: AuthSession | null;
  status: "unknown" | "unauthenticated" | "authenticating" | "authenticated";
  hydrate: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      status: "unknown",

      hydrate: async () => {
        // `persist` will already restore `session` from storage before
        // this runs; we just need to flip the status flag.
        set((s) => ({
          status: s.session ? "authenticated" : "unauthenticated",
        }));
      },

      signInWithGoogle: async () => {
        set({ status: "authenticating" });
        try {
          const session = await signInWithGoogle();
          set({ session, status: "authenticated" });
          await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(session));
        } catch (err) {
          set({ status: "unauthenticated" });
          throw err;
        }
      },

      signOut: async () => {
        await signOut();
        set({ session: null, status: "unauthenticated" });
        await AsyncStorage.removeItem(SESSIONS_KEY);
      },
    }),
    {
      name: "faaps.auth",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ session: state.session }),
    },
  ),
);

// Convenience selector
export const selectCurrentUser = (s: AuthState): User | null =>
  s.session?.user ?? null;
