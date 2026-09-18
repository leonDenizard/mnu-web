import { Bike, CreditCard, Store } from 'lucide-react'

import type { OrderSummary } from '../schemas/orders.schema'

export function OrderCard({ order }: { order: OrderSummary }) {
  return (
    <article className="rounded-xl border border-border bg-card p-3 shadow-sm">
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
    </article>
  )
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
function serviceLabel(value: OrderSummary['serviceType']) {
  return { DELIVERY: 'Entrega', PICKUP: 'Retirada', DINE_IN: 'No local' }[value]
}
function paymentLabel(value: OrderSummary['paymentMethod']) {
  return { PIX: 'Pix', CASH: 'Dinheiro', CARD: 'Cartão', OTHER: 'Outro' }[value]
}
