'use client'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { AuthSession, AuthSessionPayload } from '../schemas/auth.schema'

export function isSessionExpired(session: AuthSession) {
  return !Number.isFinite(session.expiresAt) || Date.now() >= session.expiresAt
}

type AuthSessionState = {
  session: AuthSession | null
  hasHydrated: boolean
  setSession: (session: AuthSessionPayload) => void
  clearSession: () => void
  setHasHydrated: (hasHydrated: boolean) => void
}

export const useAuthSessionStore = create<AuthSessionState>()(persist((set) => ({
  session: null,
  hasHydrated: false,
  setSession: (session) => set({
    session: { ...session, expiresAt: Date.now() + session.expiresIn * 1000 }
  }),
  clearSession: () => set({ session: null }),
  setHasHydrated: (hasHydrated) => set({ hasHydrated })
}), {
  name: 'mnu-admin-session',
  storage: createJSONStorage(() => localStorage),
  partialize: (state) => ({ session: state.session }),
  onRehydrateStorage: () => (state) => {
    if (state?.session && isSessionExpired(state.session)) state.clearSession()
    state?.setHasHydrated(true)
  }
}))
