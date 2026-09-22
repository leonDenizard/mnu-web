'use client'

import { useQuery } from '@tanstack/react-query'

import { useAuthSessionStore } from '@/modules/auth/store/auth-session.store'

import { listOrders } from '../api/orders.api'
import type { OrderStatus } from '../schemas/orders.schema'

export function useOrderReport({ page, status }: { page: number; status?: OrderStatus }) {
  const accessToken = useAuthSessionStore((state) => state.session?.accessToken)

  return useQuery({
    queryKey: ['order-report', page, status],
    queryFn: () => listOrders(accessToken!, { page, status }),
    enabled: Boolean(accessToken),
  })
}
