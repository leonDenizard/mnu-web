'use client'

import Link from 'next/link'
import { Utensils } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { useLoginViewModel } from '../view-models/use-login-view-model'

export function LoginView() {
  const { form, isSubmitting, submit } = useLoginViewModel()
  const { register, formState: { errors } } = form

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <section className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          <Utensils className="size-4" aria-hidden="true" />
          mnu
        </div>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">Entre na sua loja</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Use o e-mail e a senha cadastrados para acessar seu painel.
        </p>

        <form className="mt-8 grid gap-5" onSubmit={submit} noValidate>
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
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={Boolean(errors.password)}
              {...register('password')}
            />
            <FieldError message={errors.password?.message} />
          </div>
          <FieldError message={errors.root?.message} />
          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Entrando…' : 'Entrar'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Ainda não tem uma loja?{' '}
          <Link className="font-medium text-primary hover:text-primary-hover" href="/onboarding">
            Criar minha loja
          </Link>
        </p>
      </section>
    </main>
  )
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-sm text-destructive" role="alert">{message}</p> : null
}
