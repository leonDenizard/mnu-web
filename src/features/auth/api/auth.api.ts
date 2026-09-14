import { apiRequest } from '@/lib/api-client'

import { handoffExchangeResponseSchema } from '../schemas/auth.schema'

export function exchangeOnboardingCode(code: string) {
  return apiRequest('/auth/exchange-onboarding-code', handoffExchangeResponseSchema, {
    method: 'POST', body: JSON.stringify({ code })
  })
}
