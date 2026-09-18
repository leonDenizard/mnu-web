'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

import { ApiError } from '@/lib/api-client'

import { exchangeOnboardingCode } from '../api/auth.api'
import { useAuthSessionStore } from '../store/auth-session.store'

export function useOnboardingCompletionViewModel(code: string | null) {
  const router = useRouter()
  const setSession = useAuthSessionStore((state) => state.setSession)
  const [error, setError] = useState<string | null>(null)
  const hasStartedExchange = useRef(false)

  useEffect(() => {
    if (!code || hasStartedExchange.current) return
    hasStartedExchange.current = true

    void exchangeOnboardingCode(code)
      .then((result) => {
        setSession(result.data)
        router.replace('/kanban')
      })
      .catch((reason: unknown) => {
        setError(
          reason instanceof ApiError ? reason.message : 'Não foi possível concluir seu acesso.',
        )
      })
  }, [code, router, setSession])

  return { error: code ? error : 'Código de onboarding ausente.' }
}
