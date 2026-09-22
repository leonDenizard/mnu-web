import { z } from 'zod'

export const orderStatusSchema = z.enum([
  'PENDING',
  'IN_PREPARATION',
  'READY',
  'CANCELED',
  'FINISHED',
])

export const ordersListResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(
    z.object({
      id: z.string(),
      orderNumber: z.number(),
      customerName: z.string().nullable(),
      customerPhone: z.string().nullable(),
      serviceType: z.enum(['DELIVERY', 'PICKUP', 'DINE_IN']),
      paymentMethod: z.enum(['PIX', 'CASH', 'CARD', 'OTHER']),
      status: orderStatusSchema,
      total: z.number(),
      itemCount: z.number(),
      createdAt: z.string(),
      updatedAt: z.string(),
    }),
  ),
  meta: z.object({ total: z.number(), page: z.number(), lastPage: z.number() }),
})

export const orderStateResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    id: z.string(),
    status: orderStatusSchema,
    cancellationType: z.string().nullable(),
    cancellationReason: z.string().nullable(),
    acceptanceExpiresAt: z.string().nullable(),
    canceledAt: z.string().nullable(),
    version: z.number(),
    updatedAt: z.string(),
  }),
})

export type OrderStatus = z.infer<typeof orderStatusSchema>
export type OrderSummary = z.infer<typeof ordersListResponseSchema>['data'][number]
