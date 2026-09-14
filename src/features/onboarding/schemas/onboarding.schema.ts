import { z } from 'zod'

export const onboardingFormSchema = z.object({
  storeName: z.string().trim().min(2, 'Informe o nome do estabelecimento.'),
  ownerName: z.string().trim().min(2, 'Informe seu nome.'),
  ownerEmail: z.string().trim().email('Informe um e-mail válido.'),
  ownerPassword: z.string().min(6, 'A senha precisa ter pelo menos 6 caracteres.'),
  confirmPassword: z.string(),
  document: z.string().trim().min(11, 'Informe CPF ou CNPJ.'),
  documentType: z.enum(['CPF', 'CNPJ']),
  legalName: z.string().trim().optional()
}).refine((data) => data.ownerPassword === data.confirmPassword, {
  message: 'As senhas não coincidem.',
  path: ['confirmPassword']
})

export type OnboardingFormData = z.infer<typeof onboardingFormSchema>

export const onboardingApiResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({ handoffCode: z.string(), expiresIn: z.number() })
})
