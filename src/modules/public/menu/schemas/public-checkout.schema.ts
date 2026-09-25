import { z } from 'zod'

export const publicCheckoutFormSchema = z
  .object({
    name: z.string().trim().min(1, 'Informe seu nome.'),
    phone: z.string().regex(/^\d{10,11}$/, 'Informe um telefone válido com DDD.'),
    serviceType: z.enum(['DELIVERY', 'PICKUP', 'DINE_IN']),
    paymentMethod: z.enum(['PIX', 'CASH', 'CARD']),
    street: z.string(),
    number: z.string(),
    neighborhood: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    complement: z.string(),
  })
  .superRefine((data, context) => {
    if (data.serviceType !== 'DELIVERY') return

    for (const field of ['street', 'number', 'neighborhood', 'city', 'state', 'zipCode'] as const) {
      if (!data[field].trim()) {
        context.addIssue({
          code: 'custom',
          message: 'Preencha os dados de entrega.',
          path: [field],
        })
      }
    }
  })

export type PublicCheckoutFormData = z.infer<typeof publicCheckoutFormSchema>
