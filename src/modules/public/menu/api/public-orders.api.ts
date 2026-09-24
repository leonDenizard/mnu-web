import { z } from 'zod'

import { env } from '@/lib/env'

const createPublicOrderResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    orderId: z.string(),
    orderNumber: z.number(),
    status: z.string(),
    customerShortId: z.string(),
    customerAccessToken: z.string(),
  }),
})

const publicCustomerOrdersResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    customerName: z.string().nullable(),
    addresses: z.array(
      z.object({
        id: z.string(),
        label: z.string().nullable(),
        addressLabel: z.string(),
      }),
    ),
    orders: z.array(z.unknown()),
  }),
})

const publicCustomerProfileResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    customerName: z.string().nullable(),
    addresses: z.array(
      z.object({
        id: z.string(),
        label: z.string().nullable(),
        street: z.string(),
        number: z.number().nullable(),
        neighborhood: z.string(),
        city: z.string(),
        state: z.string(),
        zipCode: z.string(),
        complement: z.string().nullable(),
        isDefault: z.boolean(),
      }),
    ),
    orders: z.array(z.unknown()),
  }),
})

export type PublicOrderInput = {
  customerName: string
  customerPhone: string
  serviceType: 'DELIVERY' | 'PICKUP' | 'DINE_IN'
  paymentMethod: 'PIX' | 'CASH' | 'CARD'
  items: Array<{
    productId: string
    quantity: number
    orderModifierGroups: Array<{
      modifierGroupId: string
      options: Array<{ modifierOptionId: string; quantity: number }>
    }>
  }>
  deliveryStreet?: string
  deliveryAddressNumber?: number
  deliveryNeighborhood?: string
  deliveryCity?: string
  deliveryState?: string
  deliveryZipCode?: string
  deliveryComplement?: string
}

export async function createPublicOrder(slug: string, input: PublicOrderInput) {
  const response = await fetch(`${env.apiUrl}/api/public/menu/${encodeURIComponent(slug)}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  const body: unknown = await response.json()
  if (!response.ok)
    throw new Error('Não foi possível enviar o pedido. Confira seus dados e tente novamente.')
  return createPublicOrderResponseSchema.parse(body).data
}

export async function lookupPublicCustomerByPhone(slug: string, phone: string) {
  const response = await fetch(
    `${env.apiUrl}/api/public/menu/${encodeURIComponent(slug)}/customers/orders`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    },
  )
  const body: unknown = await response.json()
  if (!response.ok) throw new Error('Não foi possível consultar este telefone.')
  return publicCustomerOrdersResponseSchema.parse(body).data
}

export async function getPublicCustomerProfile(slug: string, shortId: string) {
  const response = await fetch(
    `${env.apiUrl}/api/public/menu/${encodeURIComponent(slug)}/customers/access/${encodeURIComponent(shortId)}`,
    { cache: 'no-store' },
  )
  const body: unknown = await response.json()
  if (!response.ok) throw new Error('Não foi possível recuperar seu cadastro.')
  return publicCustomerProfileResponseSchema.parse(body).data
}

export async function deletePublicCustomerAddress(
  slug: string,
  shortId: string,
  addressId: string,
) {
  const response = await fetch(
    `${env.apiUrl}/api/public/menu/${encodeURIComponent(slug)}/customers/access/${encodeURIComponent(shortId)}/addresses/${encodeURIComponent(addressId)}`,
    { method: 'DELETE' },
  )
  if (!response.ok) throw new Error('Não foi possível remover este endereço.')
}
