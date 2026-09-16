'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { isSessionExpired, useAuthSessionStore } from '@/features/auth/store/auth-session.store'
import { MenuManagementView } from '@/features/menu-imports/views/menu-management-view'

export default function DashboardPage() {
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

  return <MenuManagementView />
}
