// ============================================================
// Auth store — single source of truth for the signed-in student.
//
// The FAAPS backend is session based, so the client keeps no token: the
// session lives in the platform cookie jar. What we persist is only a
// snapshot of the signed-in account, used to render the UI before the first
// `/api/auth/me` round-trip resolves.
// ============================================================

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  getCurrentSession,
  restoreSession,
  signIn as signInRequest,
  signOut as signOutRequest,
} from "@/lib/api/auth";
import { clearSession, writeSession } from "@/lib/api/token";
import type { AuthCredentials, AuthSession } from "@/types";

interface AuthState {
  session: AuthSession | null;
  status: "unknown" | "unauthenticated" | "authenticating" | "authenticated";
  hydrate: () => Promise<void>;
  signIn: (credentials: AuthCredentials) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      status: "unknown",

      hydrate: async () => {
        // `persist` restores the snapshot from storage; it is only a hint.
        // The cookie jar is the real session, so ask the backend who we are
        // and fall back to a refresh when the session cookie expired.
        const restored = await restoreSession();
        const current = restored ?? (await getCurrentSession());
        if (current) {
          await writeSession(current);
          set({ session: current, status: "authenticated" });
        } else {
          await clearSession();
          set({ session: null, status: "unauthenticated" });
        }
      },

      signIn: async (credentials) => {
        set({ status: "authenticating" });
        try {
          const session = await signInRequest(credentials);
          await writeSession(session);
          set({ session, status: "authenticated" });
        } catch (err) {
          set({ session: null, status: "unauthenticated" });
          throw err;
        }
      },

      signOut: async () => {
        await signOutRequest();
        await clearSession();
        set({ session: null, status: "unauthenticated" });
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
export const selectCurrentUser = (s: AuthState): AuthSession | null =>
  s.session ?? null;
