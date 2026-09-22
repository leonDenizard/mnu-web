import { apiRequest } from '@/lib/api-client'

import { orderStateResponseSchema, ordersListResponseSchema } from '../schemas/orders.schema'

export function listOrders(accessToken: string) {
  return apiRequest('/api/orders?limit=50', ordersListResponseSchema, {
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
