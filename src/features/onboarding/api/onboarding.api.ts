import { apiRequest } from '@/lib/api-client'

import { onboardingApiResponseSchema, type OnboardingFormData } from '../schemas/onboarding.schema'

export async function createWebOnboarding(data: OnboardingFormData) {
  const { confirmPassword: _confirmPassword, ...payload } = data
  return apiRequest('/api/onboarding/web', onboardingApiResponseSchema, {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}
