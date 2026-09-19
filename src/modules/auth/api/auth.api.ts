import { apiRequest } from '@/lib/api-client'

import {
  authSessionSchema,
  handoffExchangeResponseSchema,
  type LoginFormData,
} from '../schemas/auth.schema'

export function exchangeOnboardingCode(code: string) {
  return apiRequest('/auth/exchange-onboarding-code', handoffExchangeResponseSchema, {
    method: 'POST',
    body: JSON.stringify({ code }),
  })
}

export function login(payload: LoginFormData) {
  return apiRequest('/auth/login', authSessionSchema, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
