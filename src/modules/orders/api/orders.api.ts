import { apiRequest } from '@/lib/api-client'

import {
  orderDetailsSchema,
  orderStateResponseSchema,
  ordersListResponseSchema,
  type OrderStatus,
} from '../schemas/orders.schema'

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

export function getOrder(orderId: string, accessToken: string) {
  return apiRequest(`/api/orders/${orderId}`, orderDetailsSchema, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
}

export function cancelOrder(
  orderId: string,
  status: OrderStatus,
  reason: string,
  accessToken: string,
) {
  const action = status === 'PENDING' ? 'reject' : 'cancel'
  return apiRequest(`/api/orders/${orderId}/${action}`, orderStateResponseSchema, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ reason }),
  })
}
