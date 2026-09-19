import { z } from 'zod'

export const authSessionSchema = z.object({
  success: z.literal(true),
  data: z.object({
    accessToken: z.string(),
    tokenType: z.literal('Bearer'),
    expiresIn: z.number(),
    user: z.object({
      id: z.string(),
      name: z.string(),
      email: z.string().email(),
      role: z.enum(['OWNER', 'STAFF']),
      storeId: z.string(),
      slug: z.string(),
      storeName: z.string(),
    }),
  }),
})

export const handoffExchangeResponseSchema = authSessionSchema

export const loginFormSchema = z.object({
  email: z.string().trim().email('Informe um e-mail válido.'),
  password: z.string().min(6, 'A senha precisa ter pelo menos 6 caracteres.'),
})

export type AuthSession = z.infer<typeof authSessionSchema>['data'] & {
  expiresAt: number
}
export type AuthSessionPayload = z.infer<typeof authSessionSchema>['data']
export type LoginFormData = z.infer<typeof loginFormSchema>
