'use client'

import { ClipboardList, LoaderCircle } from 'lucide-react'

import { OrderCard } from '../components/order-card'
import { useOrders } from '../hooks/use-orders'
import type { OrderSummary } from '../schemas/orders.schema'

const columns: Array<{ status: OrderSummary['status']; title: string }> = [
  { status: 'PENDING', title: 'Novos pedidos' },
  { status: 'IN_PREPARATION', title: 'Em preparo' },
  { status: 'READY', title: 'Prontos' },
]

export function OrdersKanbanView() {
  const { data, isPending, isError } = useOrders()
  const orders = data?.data ?? []

  return (
    <main className="min-w-0 px-5 py-8 sm:px-8">
      <header>
        <p className="text-sm font-medium text-primary">Operação</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Pedidos</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Acompanhe os pedidos em andamento da sua loja.
        </p>
      </header>
      {isPending ? (
        <div className="mt-10 flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin" />
          Carregando pedidos…
        </div>
      ) : isError ? (
        <p className="mt-10 text-sm text-destructive">Não foi possível carregar os pedidos.</p>
      ) : (
        <div className="mt-8 flex gap-4 overflow-x-auto pb-4">
          {columns.map((column) => {
            const columnOrders = orders.filter((order) => order.status === column.status)
            return (
              <section
                className="w-72 shrink-0 rounded-xl border border-border bg-card p-3"
                key={column.status}
              >
                <header className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold">{column.title}</h2>
                  <span className="rounded-full bg-card px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {columnOrders.length}
                  </span>
                </header>
                <div className="mt-3 grid gap-3">
                  {columnOrders.length > 0 ? (
                    columnOrders.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                      />
                    ))
                  ) : (
                    <div className="flex min-h-32 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/60 px-4 text-center">
                      <ClipboardList className="size-5 text-muted-foreground" />
                      <p className="mt-2 text-xs text-muted-foreground">Nenhum pedido aqui.</p>
                    </div>
                  )}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </main>
  )
}
