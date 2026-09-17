import { apiRequest } from '@/lib/api-client'

import { ordersListResponseSchema } from '../schemas/orders.schema'

export function listOrders(accessToken: string) {
  return apiRequest('/api/orders?limit=50', ordersListResponseSchema, {
    headers: { Authorization: `Bearer ${accessToken}` }
  })
}
