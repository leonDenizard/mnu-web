import { z } from 'zod'

import { env } from '@/lib/env'

const createPublicOrderResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({ orderId: z.string(), orderNumber: z.number(), status: z.string(), customerShortId: z.string(), customerAccessToken: z.string() }),
})

export type PublicOrderInput = {
  customerName: string
  customerPhone: string
  serviceType: 'DELIVERY' | 'PICKUP' | 'DINE_IN'
  paymentMethod: 'PIX' | 'CASH' | 'CARD'
  items: Array<{ productId: string; quantity: number; orderModifierGroups: Array<{ modifierGroupId: string; options: Array<{ modifierOptionId: string; quantity: number }> }> }>
  deliveryStreet?: string
  deliveryAddressNumber?: number
  deliveryNeighborhood?: string
  deliveryCity?: string
  deliveryState?: string
  deliveryZipCode?: string
  deliveryComplement?: string
}

export async function createPublicOrder(slug: string, input: PublicOrderInput) {
  const response = await fetch(`${env.apiUrl}/api/public/menu/${encodeURIComponent(slug)}/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) })
  const body: unknown = await response.json()
  if (!response.ok) throw new Error('Não foi possível enviar o pedido. Confira seus dados e tente novamente.')
  return createPublicOrderResponseSchema.parse(body).data
}
