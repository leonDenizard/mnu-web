'use client'

import { useQuery } from '@tanstack/react-query'

import { useAuthSessionStore } from '@/modules/auth/store/auth-session.store'

import { getCurrentStore } from '../api/store.api'

export function useCurrentStore() {
  const accessToken = useAuthSessionStore((state) => state.session?.accessToken)

  return useQuery({
    queryKey: ['current-store'],
    queryFn: () => getCurrentStore(accessToken!),
    enabled: Boolean(accessToken),
  })
}
