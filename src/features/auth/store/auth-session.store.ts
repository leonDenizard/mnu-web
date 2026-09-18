'use client'

import { create } from 'zustand'
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'

import type { AuthSession, AuthSessionPayload } from '../schemas/auth.schema'

export function isSessionExpired(session: AuthSession) {
  return !Number.isFinite(session.expiresAt) || Date.now() >= session.expiresAt
}

const authSessionStorage: StateStorage = {
  getItem: (name) => {
    const persistentValue = localStorage.getItem(name)
    if (!persistentValue) return sessionStorage.getItem(name)

    const storedState = JSON.parse(persistentValue) as {
      state?: { rememberSession?: boolean }
    }

    if (storedState.state && storedState.state.rememberSession === undefined) {
      storedState.state.rememberSession = true
      return JSON.stringify(storedState)
    }

    return persistentValue
  },
  setItem: (name, value) => {
    const storedState = JSON.parse(value) as { state?: { rememberSession?: boolean } }
    const storage = storedState.state?.rememberSession ? localStorage : sessionStorage
    const alternateStorage = storage === localStorage ? sessionStorage : localStorage

    alternateStorage.removeItem(name)
    storage.setItem(name, value)
  },
  removeItem: (name) => {
    localStorage.removeItem(name)
    sessionStorage.removeItem(name)
  },
}

type AuthSessionState = {
  session: AuthSession | null
  rememberSession: boolean
  hasHydrated: boolean
  setSession: (session: AuthSessionPayload, rememberSession?: boolean) => void
  clearSession: () => void
  setHasHydrated: (hasHydrated: boolean) => void
}

export const useAuthSessionStore = create<AuthSessionState>()(
  persist(
    (set) => ({
      session: null,
      rememberSession: false,
      hasHydrated: false,
      setSession: (session, rememberSession = false) =>
        set({
          session: { ...session, expiresAt: Date.now() + session.expiresIn * 1000 },
          rememberSession,
        }),
      clearSession: () => set({ session: null, rememberSession: false }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: 'mnu-admin-session',
      storage: createJSONStorage(() => authSessionStorage),
      partialize: (state) => ({
        session: state.session,
        rememberSession: state.rememberSession,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.session && isSessionExpired(state.session)) state.clearSession()
        state?.setHasHydrated(true)
      },
    },
  ),
)
