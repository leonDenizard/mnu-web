'use client'

import { ClipboardList, LoaderCircle } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import { useAuthSessionStore } from '@/modules/auth/store/auth-session.store'
import { cancelOrder, transitionOrder } from '../api/orders.api'
import { OrderCard } from '../components/order-card'
import { OrderDetailsDialog } from '../components/order-details-dialog'
import { useOrderEvents } from '../hooks/use-order-events'
import { useOrders } from '../hooks/use-orders'
import type { OrderDetails, OrderSummary } from '../schemas/orders.schema'

const columns: Array<{ status: OrderSummary['status']; title: string }> = [
  { status: 'PENDING', title: 'Aguardando aceite' },
  { status: 'IN_PREPARATION', title: 'Em preparo' },
  { status: 'READY', title: 'Prontos' },
]

const acceptanceTimeoutInMilliseconds = 5 * 60 * 1000

export function OrdersKanbanView() {
  const { data, isPending, isError } = useOrders()
  const accessToken = useAuthSessionStore((state) => state.session?.accessToken)
  const queryClient = useQueryClient()
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(() => Date.now())

  useEffect(() => {
    const intervalId = window.setInterval(() => setCurrentTime(Date.now()), 1000)
    return () => window.clearInterval(intervalId)
  }, [])
  const transitionMutation = useMutation({
    mutationFn: ({ orderId, action }: { orderId: string; action: 'accept' | 'ready' | 'finish' }) =>
      transitionOrder(orderId, action, accessToken!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  })
  const cancelMutation = useMutation({
    mutationFn: ({ order, reason }: { order: OrderDetails; reason: string }) =>
      cancelOrder(order.id, order.status, reason, accessToken!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['order', selectedOrderId] })
      setSelectedOrderId(null)
    },
  })
  useOrderEvents()
  const orders = data?.data ?? []
  const visibleOrders = orders.filter(
    (order) =>
      order.status !== 'CANCELED' &&
      (order.status !== 'PENDING' || getAcceptanceDeadline(order) > currentTime),
  )

  return (
    <main className="flex min-h-dvh min-w-0 flex-col px-5 py-8 sm:px-8 md:min-h-[calc(100dvh-57px)]">
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
        <div className="mt-8 grid flex-1 grid-cols-1 gap-6 pb-4 lg:grid-cols-3">
          {columns.map((column) => {
            const columnOrders = visibleOrders.filter((order) => order.status === column.status)
            return (
              <section
                className="flex min-h-72 min-w-0 flex-col"
                key={column.status}
              >
                <header className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold">{column.title}</h2>
                  <span className="rounded-full bg-card px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {columnOrders.length}
                  </span>
                </header>
                <div className="mt-3 grid content-start gap-3">
                  {columnOrders.length > 0 ? (
                    columnOrders.map((order) => (
                      <OrderCard
                        isTransitioning={
                          transitionMutation.isPending &&
                          transitionMutation.variables?.orderId === order.id
                        }
                        key={order.id}
                        onOpenDetails={setSelectedOrderId}
                        onTransition={(order, action) =>
                          transitionMutation.mutate({ orderId: order.id, action })
                        }
                        order={order}
                        remainingAcceptanceSeconds={
                          order.status === 'PENDING'
                            ? getRemainingAcceptanceSeconds(order, currentTime)
                            : undefined
                        }
                      />
                    ))
                  ) : (
                    <div className="flex min-h-32 flex-col items-center justify-center rounded-lg bg-muted/40 px-4 text-center">
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
      <OrderDetailsDialog
        isCancelling={cancelMutation.isPending}
        onCancel={(order, reason) => cancelMutation.mutate({ order, reason })}
        onClose={() => setSelectedOrderId(null)}
        orderId={selectedOrderId}
      />
    </main>
  )
}

function getAcceptanceDeadline(order: OrderSummary) {
  return new Date(order.createdAt).getTime() + acceptanceTimeoutInMilliseconds
}

function getRemainingAcceptanceSeconds(order: OrderSummary, currentTime: number) {
  return Math.max(0, Math.ceil((getAcceptanceDeadline(order) - currentTime) / 1000))
}
