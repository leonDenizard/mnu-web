'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { ApiError } from '@/lib/api-client'
import { env } from '@/lib/env'

import { useCreateWebOnboarding } from '../hooks/use-create-web-onboarding'
import { onboardingFormSchema, type OnboardingFormData } from '../schemas/onboarding.schema'

export function useOnboardingViewModel() {
  const mutation = useCreateWebOnboarding()
  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingFormSchema),
    defaultValues: { documentType: 'CPF', legalName: '' }
  })

  const submit = form.handleSubmit(async (data) => {
    try {
      const result = await mutation.mutateAsync(data)
      window.location.assign(`${env.appUrl}/onboarding/complete?code=${encodeURIComponent(result.data.handoffCode)}`)
    } catch (error) {
      form.setError('root', {
        message: error instanceof ApiError ? error.message : 'Não foi possível criar sua loja.'
      })
    }
  })

  return { form, submit, isSubmitting: mutation.isPending }
}
