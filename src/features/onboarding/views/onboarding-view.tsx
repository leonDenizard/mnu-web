'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { useOnboardingViewModel } from '../view-models/use-onboarding-view-model'

export function OnboardingView() {
  const { form, submit, isSubmitting } = useOnboardingViewModel()
  const { register, formState: { errors } } = form

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Crie sua loja</CardTitle>
        <CardDescription>Você entrará no painel assim que concluir o cadastro.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5" onSubmit={submit} noValidate>
          <div className="grid gap-2">
            <Label htmlFor="storeName">Nome da loja</Label>
            <Input id="storeName" autoComplete="organization" {...register('storeName')} />
            <FieldError message={errors.storeName?.message} />
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <Field label="Seu nome" id="ownerName" error={errors.ownerName?.message} inputProps={register('ownerName')} />
            <Field label="E-mail" id="ownerEmail" type="email" error={errors.ownerEmail?.message} inputProps={register('ownerEmail')} />
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <Field label="Senha" id="ownerPassword" type="password" error={errors.ownerPassword?.message} inputProps={register('ownerPassword')} />
            <Field label="Confirmar senha" id="confirmPassword" type="password" error={errors.confirmPassword?.message} inputProps={register('confirmPassword')} />
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="documentType">Tipo de documento</Label>
              <select id="documentType" className="h-9 rounded-md border bg-transparent px-3 text-sm" {...register('documentType')}>
                <option value="CPF">CPF</option>
                <option value="CNPJ">CNPJ</option>
              </select>
            </div>
            <Field label="CPF ou CNPJ" id="document" error={errors.document?.message} inputProps={register('document')} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="legalName">Razão social <span className="text-muted-foreground">(opcional)</span></Label>
            <Input id="legalName" {...register('legalName')} />
          </div>
          <FieldError message={errors.root?.message} />
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Criando sua loja…' : 'Criar loja e entrar'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function Field({ label, id, type = 'text', error, inputProps }: {
  label: string
  id: string
  type?: string
  error?: string
  inputProps: ReturnType<ReturnType<typeof useOnboardingViewModel>['form']['register']>
}) {
  return <div className="grid gap-2"><Label htmlFor={id}>{label}</Label><Input id={id} type={type} {...inputProps} /><FieldError message={error} /></div>
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-sm text-destructive">{message}</p> : null
}
