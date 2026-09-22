import { apiRequest } from '@/lib/api-client'

import { orderStateResponseSchema, ordersListResponseSchema } from '../schemas/orders.schema'

type ListOrdersParameters = {
  page?: number
  status?: string
}

export function listOrders(accessToken: string, { page = 1, status }: ListOrdersParameters = {}) {
  const parameters = new URLSearchParams({ limit: '50', page: String(page) })
  if (status) parameters.set('status', status)

  return apiRequest(`/api/orders?${parameters.toString()}`, ordersListResponseSchema, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
}

export function transitionOrder(
  orderId: string,
  action: 'accept' | 'ready' | 'finish',
  accessToken: string,
) {
  return apiRequest(`/api/orders/${orderId}/${action}`, orderStateResponseSchema, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${accessToken}` },
  })
}
