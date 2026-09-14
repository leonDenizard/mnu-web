'use client'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { AuthSession } from '../schemas/auth.schema'

type AuthSessionState = {
  session: AuthSession | null
  setSession: (session: AuthSession) => void
  clearSession: () => void
}

export const useAuthSessionStore = create<AuthSessionState>()(persist((set) => ({
  session: null,
  setSession: (session) => set({ session }),
  clearSession: () => set({ session: null })
}), {
  name: 'mnu-admin-session',
  storage: createJSONStorage(() => sessionStorage)
}))
