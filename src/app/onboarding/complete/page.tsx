import { Suspense } from 'react'

import { OnboardingCompletionView } from '@/features/auth/views/onboarding-completion-view'

export default function OnboardingCompletionPage() {
  return <main className="flex min-h-screen items-center justify-center bg-stone-50 px-6"><Suspense><OnboardingCompletionView /></Suspense></main>
}
