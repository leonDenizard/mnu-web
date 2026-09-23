'use client'

import { useQuery } from '@tanstack/react-query'

import { useAuthSessionStore } from '@/modules/auth/store/auth-session.store'

import { getOrder } from '../api/orders.api'

export function useOrderDetails(orderId: string | null) {
  const accessToken = useAuthSessionStore((state) => state.session?.accessToken)

  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrder(orderId!, accessToken!),
    enabled: Boolean(orderId && accessToken),
  })
}
