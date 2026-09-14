import { z } from 'zod'

export const handoffExchangeResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    accessToken: z.string(),
    tokenType: z.literal('Bearer'),
    expiresIn: z.number(),
    user: z.object({
      id: z.string(), name: z.string(), email: z.string().email(),
      role: z.enum(['OWNER', 'STAFF']), storeId: z.string(), slug: z.string(), storeName: z.string()
    })
  })
})

export type AuthSession = z.infer<typeof handoffExchangeResponseSchema>['data']
