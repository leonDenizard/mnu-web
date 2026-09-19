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

export type OrderSummary = z.infer<typeof ordersListResponseSchema>['data'][number]
