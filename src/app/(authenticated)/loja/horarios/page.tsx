'use client'

import { LoaderCircle } from 'lucide-react'

import { useCurrentStore } from '@/modules/store/hooks/use-current-store'
import { StoreAvailabilityView } from '@/modules/store/views/store-availability-view'

export default function StoreHoursPage() {
  const storeQuery = useCurrentStore()
  const store = storeQuery.data?.data

  if (storeQuery.isPending) {
    return (
      <main className="flex min-h-64 items-center justify-center gap-2 px-5 py-8 text-sm text-muted-foreground sm:px-8">
        <LoaderCircle className="size-4 animate-spin" /> Carregando disponibilidade…
      </main>
    )
  }

  if (!store) {
    return (
      <main className="px-5 py-8 text-sm text-destructive sm:px-8">
        Não foi possível carregar os horários da loja.
      </main>
    )
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-8 sm:px-8">
      <header>
        <p className="text-sm font-medium text-primary">Loja</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Horários e disponibilidade</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Configure quando seu cardápio pode receber pedidos.
        </p>
      </header>
      <StoreAvailabilityView initialMode={store.availabilityMode} />
    </main>
  )
}
