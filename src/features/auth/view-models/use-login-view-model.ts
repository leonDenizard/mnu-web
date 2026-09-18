'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'

import { ApiError } from '@/lib/api-client'

import { useLogin } from '../hooks/use-login'
import { loginFormSchema, type LoginFormData } from '../schemas/auth.schema'
import { useAuthSessionStore } from '../store/auth-session.store'

export function useLoginViewModel() {
  const router = useRouter()
  const setSession = useAuthSessionStore((state) => state.setSession)
  const mutation = useLogin()
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: '', password: '' },
  })

  const submit = (rememberSession: boolean) =>
    form.handleSubmit(async (data) => {
      try {
        const result = await mutation.mutateAsync(data)
        setSession(result.data, rememberSession)
        router.replace('/kanban')
      } catch (error) {
        form.setError('root', {
          message:
            error instanceof ApiError && error.code === 'UNAUTHORIZED'
              ? 'E-mail ou senha inválidos.'
              : error instanceof ApiError
                ? error.message
                : 'Não foi possível entrar. Tente novamente.',
        })
      }
    })

  return { form, isSubmitting: mutation.isPending, submit }
}
