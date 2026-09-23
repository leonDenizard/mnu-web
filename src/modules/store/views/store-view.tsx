'use client'

import { LoaderCircle, Store } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useAuthSessionStore } from '@/modules/auth/store/auth-session.store'

import { setStoreOpen, updateCurrentStore } from '../api/store.api'
import { useCurrentStore } from '../hooks/use-current-store'

export function StoreView() {
  const accessToken = useAuthSessionStore((state) => state.session?.accessToken)
  const queryClient = useQueryClient()
  const storeQuery = useCurrentStore()
  const refreshStore = () => queryClient.invalidateQueries({ queryKey: ['current-store'] })
  const updateMutation = useMutation({
    mutationFn: (input: Parameters<typeof updateCurrentStore>[0]) =>
      updateCurrentStore(input, accessToken!),
    onSuccess: refreshStore,
  })
  const openMutation = useMutation({
    mutationFn: (isOpen: boolean) => setStoreOpen(isOpen, accessToken!),
    onSuccess: refreshStore,
  })
  const store = storeQuery.data?.data

  function saveStore(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const fields = new FormData(event.currentTarget)
    const optionalText = (name: string) => String(fields.get(name) ?? '').trim()
    const radius = Number(fields.get('deliveryRadiusKm'))
    const fee = Number(fields.get('deliveryFee'))
    updateMutation.mutate({
      name: optionalText('name'),
      legalName: optionalText('legalName'),
      phone: optionalText('phone'),
      whatsapp: optionalText('whatsapp'),
      addressLine: optionalText('addressLine'),
      addressNumber: optionalText('addressNumber'),
      neighborhood: optionalText('neighborhood'),
      city: optionalText('city'),
      state: optionalText('state'),
      zipCode: optionalText('zipCode'),
      ...(Number.isFinite(radius) && radius >= 0 ? { deliveryRadiusKm: radius } : {}),
      ...(Number.isFinite(fee) && fee >= 0 ? { deliveryFeeCents: Math.round(fee * 100) } : {}),
    })
  }

  if (storeQuery.isPending) {
    return (
      <main className="flex min-h-64 items-center justify-center gap-2 px-5 py-8 text-sm text-muted-foreground sm:px-8">
        <LoaderCircle className="size-4 animate-spin" /> Carregando configurações…
      </main>
    )
  }

  if (storeQuery.isError || !store) {
    return (
      <main className="px-5 py-8 text-sm text-destructive sm:px-8">
        Não foi possível carregar as configurações da loja.
      </main>
    )
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
      <header className="max-w-2xl">
        <p className="text-sm font-medium text-primary">Loja</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Configurações da loja</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Defina como sua loja atende e as informações exibidas para seus clientes.
        </p>
      </header>

      <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Card>
          <CardHeader>
            <CardTitle>Disponibilidade</CardTitle>
            <CardDescription>
              Controle se a loja está recebendo pedidos neste momento.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span
                className={`size-3 rounded-full ${store.isOpen ? 'bg-emerald-500' : 'bg-red-500'}`}
              />
              <div>
                <p className="font-medium">{store.isOpen ? 'Loja aberta' : 'Loja fechada'}</p>
                <p className="text-sm text-muted-foreground">
                  {store.isOpen
                    ? 'Clientes já podem enviar pedidos.'
                    : 'O cardápio não aceitará novos pedidos.'}
                </p>
              </div>
            </div>
            <Switch
              aria-label={store.isOpen ? 'Fechar loja' : 'Abrir loja'}
              checked={store.isOpen}
              disabled={openMutation.isPending}
              onCheckedChange={(isOpen) => openMutation.mutate(isOpen)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fluxo de pedidos</CardTitle>
            <CardDescription>Escolha se o aceite acontece automaticamente.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4">
            <Label htmlFor="autoAcceptOrders">Aceitar automaticamente</Label>
            <Switch
              checked={store.autoAcceptOrders}
              disabled={updateMutation.isPending}
              id="autoAcceptOrders"
              onCheckedChange={(autoAcceptOrders) => updateMutation.mutate({ autoAcceptOrders })}
            />
          </CardContent>
        </Card>
      </section>

      <form
        className="mt-6 grid gap-6"
        onSubmit={saveStore}
      >
        <Card>
          <CardHeader>
            <CardTitle>Dados da loja</CardTitle>
            <CardDescription>Informações de contato apresentadas no seu cardápio.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field
              defaultValue={store.name}
              label="Nome da loja"
              name="name"
              required
            />
            <Field
              defaultValue={store.legalName ?? ''}
              label="Razão social"
              name="legalName"
            />
            <Field
              defaultValue={store.phone ?? ''}
              label="Telefone"
              name="phone"
              type="tel"
            />
            <Field
              defaultValue={store.whatsapp ?? ''}
              label="WhatsApp"
              name="whatsapp"
              type="tel"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Endereço</CardTitle>
            <CardDescription>
              Usado como referência para entregas e retirada no local.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field
              className="lg:col-span-2"
              defaultValue={store.addressLine ?? ''}
              label="Endereço"
              name="addressLine"
            />
            <Field
              defaultValue={store.addressNumber ?? ''}
              label="Número"
              name="addressNumber"
            />
            <Field
              defaultValue={store.neighborhood ?? ''}
              label="Bairro"
              name="neighborhood"
            />
            <Field
              className="lg:col-span-2"
              defaultValue={store.city ?? ''}
              label="Cidade"
              name="city"
            />
            <Field
              defaultValue={store.state ?? ''}
              label="Estado"
              name="state"
            />
            <Field
              defaultValue={store.zipCode ?? ''}
              label="CEP"
              name="zipCode"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Modalidades e entrega</CardTitle>
            <CardDescription>
              Escolha as formas de atendimento disponíveis no cardápio.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <ToggleRow
                checked={store.supportsDelivery}
                disabled={updateMutation.isPending}
                label="Entrega"
                onChange={(supportsDelivery) => updateMutation.mutate({ supportsDelivery })}
              />
              <ToggleRow
                checked={store.supportsPickup}
                disabled={updateMutation.isPending}
                label="Retirada"
                onChange={(supportsPickup) => updateMutation.mutate({ supportsPickup })}
              />
              <ToggleRow
                checked={store.supportsDineIn}
                disabled={updateMutation.isPending}
                label="No local"
                onChange={(supportsDineIn) => updateMutation.mutate({ supportsDineIn })}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                defaultValue={store.deliveryRadiusKm ?? ''}
                label="Raio de entrega (km)"
                min="0"
                name="deliveryRadiusKm"
                step="0.1"
                type="number"
              />
              <Field
                defaultValue={store.deliveryFeeCents === null ? '' : store.deliveryFeeCents / 100}
                label="Taxa de entrega (R$)"
                min="0"
                name="deliveryFee"
                step="0.01"
                type="number"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            disabled={updateMutation.isPending}
            type="submit"
          >
            {updateMutation.isPending ? <LoaderCircle className="animate-spin" /> : <Store />}
            Salvar configurações
          </Button>
        </div>
        {updateMutation.isError ? (
          <p className="text-right text-sm text-destructive">
            Não foi possível salvar as configurações.
          </p>
        ) : null}
      </form>
    </main>
  )
}

function Field({
  label,
  className,
  ...props
}: { label: string; className?: string } & React.ComponentProps<typeof Input>) {
  const id = props.id ?? props.name
  return (
    <label
      className={`grid gap-2 text-sm font-medium ${className ?? ''}`}
      htmlFor={id}
    >
      <span>{label}</span>
      <Input
        id={id}
        {...props}
      />
    </label>
  )
}

function ToggleRow({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string
  checked: boolean
  disabled: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border px-3 py-3">
      <span className="font-medium">{label}</span>
      <Switch
        aria-label={label}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onChange}
      />
    </div>
  )
}
