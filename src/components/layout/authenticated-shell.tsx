'use client'

import { useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'

import { isSessionExpired, useAuthSessionStore } from '@/modules/auth/store/auth-session.store'

import { AppNavigation } from './app-navigation'
import { AppHeader } from './app-header'

export function AuthenticatedShell({ children }: { children: ReactNode }) {
  const session = useAuthSessionStore((state) => state.session)
  const hasHydrated = useAuthSessionStore((state) => state.hasHydrated)
  const clearSession = useAuthSessionStore((state) => state.clearSession)
  const router = useRouter()

  useEffect(() => {
    if (!hasHydrated) return
    if (!session || isSessionExpired(session)) {
      if (session) clearSession()
      router.replace('/login')
    }
  }, [clearSession, hasHydrated, router, session])

  if (!hasHydrated || !session || isSessionExpired(session)) return null

  return (
    <div className="min-h-screen bg-background">
      <AppNavigation />
      <div className="md:pl-72">
        <AppHeader />
        {children}
      </div>
    </div>
  )
}
