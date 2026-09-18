'use client'

import { useQuery } from '@tanstack/react-query'

import { useAuthSessionStore } from '@/features/auth/store/auth-session.store'

import { listOrders } from '../api/orders.api'

export function useOrders() {
  const accessToken = useAuthSessionStore((state) => state.session?.accessToken)
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => listOrders(accessToken!),
    enabled: Boolean(accessToken),
    refetchInterval: 30_000,
  })
}
