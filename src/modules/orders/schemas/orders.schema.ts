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
      cancellationType: z.string().nullable(),
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

const orderDetailsSchema = z.object({
  success: z.literal(true),
  data: z.object({
    id: z.string(),
    orderNumber: z.number(),
    customerName: z.string().nullable(),
    customerPhone: z.string().nullable(),
    serviceType: z.enum(['DELIVERY', 'PICKUP', 'DINE_IN']),
    paymentMethod: z.enum(['PIX', 'CASH', 'CARD', 'OTHER']),
    status: orderStatusSchema,
    total: z.number(),
    noteOrder: z.string().optional().nullable(),
    cancellationType: z.string().optional().nullable(),
    cancellationReason: z.string().optional().nullable(),
    deliveryStreet: z.string().optional().nullable(),
    deliveryAddressNumber: z.number().optional().nullable(),
    deliveryNeighborhood: z.string().optional().nullable(),
    deliveryCity: z.string().optional().nullable(),
    deliveryState: z.string().optional().nullable(),
    deliveryZipCode: z.string().optional().nullable(),
    deliveryComplement: z.string().optional().nullable(),
    items: z.array(
      z.object({
        id: z.string(),
        productNameSnapshot: z.string(),
        unitPrice: z.number(),
        quantity: z.number(),
        total: z.number(),
        noteItem: z.string().optional().nullable(),
        orderModifierGroups: z.array(
          z.object({
            id: z.string(),
            groupNameSnapshot: z.string(),
            options: z.array(
              z.object({
                id: z.string(),
                optionNameSnapshot: z.string(),
                optionPriceSnapshot: z.number(),
                quantity: z.number(),
              }),
            ),
          }),
        ),
      }),
    ),
  }),
})

export type OrderStatus = z.infer<typeof orderStatusSchema>
export type OrderSummary = z.infer<typeof ordersListResponseSchema>['data'][number]
export type OrderDetails = z.infer<typeof orderDetailsSchema>['data']
export { orderDetailsSchema }
