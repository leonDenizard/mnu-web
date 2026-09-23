import { ArrowRight, Bike, Check, Clock3, CreditCard, LoaderCircle, Store } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { OrderSummary } from '../schemas/orders.schema'

type OrderCardProps = {
  order: OrderSummary
  isTransitioning?: boolean
  onOpenDetails: (orderId: string) => void
  onTransition: (order: OrderSummary, action: 'accept' | 'ready' | 'finish') => void
  remainingAcceptanceSeconds?: number
}

export function OrderCard({
  order,
  isTransitioning,
  onOpenDetails,
  onTransition,
  remainingAcceptanceSeconds,
}: OrderCardProps) {
  const nextAction = getNextAction(order.status)

  return (
    <article className="rounded-xl border border-border bg-card p-3 shadow-sm">
      <button
        className="block w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        onClick={() => onOpenDetails(order.id)}
        type="button"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Pedido #{order.orderNumber}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {order.customerName || 'Cliente não identificado'}
            </p>
          </div>
          <p className="text-sm font-semibold text-primary">{formatCurrency(order.total)}</p>
        </div>
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>
            {order.itemCount} {order.itemCount === 1 ? 'item' : 'itens'}
          </span>
          <span className="flex items-center gap-1">
            {order.serviceType === 'DELIVERY' ? (
              <Bike className="size-3" />
            ) : (
              <Store className="size-3" />
            )}
            {serviceLabel(order.serviceType)}
          </span>
          <span className="flex items-center gap-1">
            <CreditCard className="size-3" />
            {paymentLabel(order.paymentMethod)}
          </span>
        </div>
        {remainingAcceptanceSeconds !== undefined ? (
          <p
            className={
              remainingAcceptanceSeconds <= 60
                ? 'mt-3 flex items-center gap-1 text-xs font-medium text-destructive'
                : 'mt-3 flex items-center gap-1 text-xs font-medium text-muted-foreground'
            }
          >
            <Clock3 className="size-3.5" />
            Aceitar em {formatRemainingTime(remainingAcceptanceSeconds)}
          </p>
        ) : null}
      </button>
      {nextAction ? (
        <Button
          className="mt-3 w-full"
          disabled={isTransitioning}
          onClick={() => onTransition(order, nextAction.action)}
          size="sm"
        >
          {isTransitioning ? (
            <LoaderCircle className="size-3.5 animate-spin" />
          ) : nextAction.action === 'finish' ? (
            <Check className="size-3.5" />
          ) : (
            <ArrowRight className="size-3.5" />
          )}
          {nextAction.label}
        </Button>
      ) : null}
    </article>
  )
}

function getNextAction(status: OrderSummary['status']) {
  if (status === 'PENDING') return { action: 'accept' as const, label: 'Aceitar pedido' }
  if (status === 'IN_PREPARATION') return { action: 'ready' as const, label: 'Marcar como pronto' }
  if (status === 'READY') return { action: 'finish' as const, label: 'Finalizar pedido' }
  return null
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
function formatRemainingTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}
function serviceLabel(value: OrderSummary['serviceType']) {
  return { DELIVERY: 'Entrega', PICKUP: 'Retirada', DINE_IN: 'No local' }[value]
}
function paymentLabel(value: OrderSummary['paymentMethod']) {
  return { PIX: 'Pix', CASH: 'Dinheiro', CARD: 'Cartão', OTHER: 'Outro' }[value]
}
