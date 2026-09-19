'use client'

import { useSearchParams } from 'next/navigation'

import { useOnboardingCompletionViewModel } from '../view-models/use-onboarding-completion-view-model'

export function OnboardingCompletionView() {
  const searchParams = useSearchParams()
  const { error } = useOnboardingCompletionViewModel(searchParams.get('code'))
  return (
    <p className="text-center text-sm text-muted-foreground">
      {error ?? 'Preparando o seu painel…'}
    </p>
  )
}
