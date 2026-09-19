'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Eye, EyeOff, Utensils } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { useLoginViewModel } from '../view-models/use-login-view-model'

export function LoginView() {
  const { form, isSubmitting, submit } = useLoginViewModel()
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [rememberSession, setRememberSession] = useState(true)
  const {
    register,
    formState: { errors },
  } = form

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <section className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          <Utensils
            className="size-4"
            aria-hidden="true"
          />
          mnu
        </div>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">Entre na sua loja</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Use o e-mail e a senha cadastrados para acessar seu painel.
        </p>

        <form
          className="mt-8 grid gap-5"
          onSubmit={submit(rememberSession)}
          noValidate
        >
          <div className="grid gap-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              aria-invalid={Boolean(errors.email)}
              {...register('email')}
            />
            <FieldError message={errors.email?.message} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Input
                id="password"
                type={isPasswordVisible ? 'text' : 'password'}
                autoComplete="current-password"
                className={
                  isPasswordVisible ? 'pr-11' : 'pr-11 text-xl tracking-[0.12em] md:text-xl'
                }
                aria-invalid={Boolean(errors.password)}
                {...register('password')}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                aria-label={isPasswordVisible ? 'Ocultar senha' : 'Mostrar senha'}
                aria-pressed={isPasswordVisible}
                onClick={() => setIsPasswordVisible((visible) => !visible)}
              >
                {isPasswordVisible ? (
                  <EyeOff
                    className="size-4"
                    aria-hidden="true"
                  />
                ) : (
                  <Eye
                    className="size-4"
                    aria-hidden="true"
                  />
                )}
              </button>
            </div>
            <FieldError message={errors.password?.message} />
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              className="size-4 rounded border-input accent-primary"
              checked={rememberSession}
              onChange={(event) => setRememberSession(event.target.checked)}
            />
            Manter-me conectado neste dispositivo
          </label>
          <FieldError message={errors.root?.message} />
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Entrando…' : 'Entrar'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Ainda não tem uma loja?{' '}
          <Link
            className="font-medium text-primary hover:text-primary-hover"
            href="/onboarding"
          >
            Criar minha loja
          </Link>
        </p>
      </section>
    </main>
  )
}

function FieldError({ message }: { message?: string }) {
  return message ? (
    <p
      className="text-sm text-destructive"
      role="alert"
    >
      {message}
    </p>
  ) : null
}
