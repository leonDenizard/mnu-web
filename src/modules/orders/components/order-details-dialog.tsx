'use client'

import { Bike, CreditCard, LoaderCircle, Printer, Store, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { useOrderDetails } from '../hooks/use-order-details'
import type { OrderDetails, OrderStatus } from '../schemas/orders.schema'

type OrderDetailsDialogProps = {
  orderId: string | null
  onCancel: (order: OrderDetails, reason: string) => void
  onClose: () => void
  isCancelling: boolean
}

export function OrderDetailsDialog({
  orderId,
  onCancel,
  onClose,
  isCancelling,
}: OrderDetailsDialogProps) {
  const { data, isError, isPending } = useOrderDetails(orderId)
  const [cancelingOrderId, setCancelingOrderId] = useState<string | null>(null)
  const [cancellationReason, setCancellationReason] = useState('')
  const order = data?.data
  const isCanceling = cancelingOrderId === orderId

  useEffect(() => {
    if (!orderId) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [orderId])

  if (!orderId) return null

  function handleClose() {
    setCancelingOrderId(null)
    setCancellationReason('')
    onClose()
  }

  function handleOpenCancel() {
    setCancellationReason('')
    setCancelingOrderId(orderId)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm"
      role="presentation"
    >
      <section
        aria-labelledby="order-details-title"
        aria-modal="true"
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl sm:p-8"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-primary">Detalhes do pedido</p>
            <h2
              className="mt-1 text-2xl font-semibold"
              id="order-details-title"
            >
              {order ? `Pedido #${order.orderNumber}` : 'Carregando pedido'}
            </h2>
          </div>
          <div className="flex items-center gap-1">
            <Button
              aria-label="Imprimir pedido"
              onClick={() => window.print()}
              size="icon"
              title="Imprimir pedido"
              variant="ghost"
            >
              <Printer />
            </Button>
            <Button
              aria-label="Fechar detalhes"
              onClick={handleClose}
              size="icon"
              title="Fechar"
              variant="ghost"
            >
              <X />
            </Button>
          </div>
        </div>

        {isPending ? (
          <div className="flex min-h-64 items-center justify-center gap-2 text-sm text-muted-foreground">
            <LoaderCircle className="size-4 animate-spin" /> Carregando pedido…
          </div>
        ) : isError || !order ? (
          <p className="py-10 text-sm text-destructive">
            Não foi possível carregar os detalhes deste pedido.
          </p>
        ) : (
          <OrderDetailsContent
            isCanceling={isCanceling}
            isCancelling={isCancelling}
            onCancel={() => {
              if (!cancellationReason.trim()) return
              onCancel(order, cancellationReason.trim())
            }}
            onOpenCancel={handleOpenCancel}
            onReasonChange={setCancellationReason}
            order={order}
            reason={cancellationReason}
          />
        )}
      </section>
    </div>
  )
}

function OrderDetailsContent({
  isCanceling,
  isCancelling,
  onCancel,
  onOpenCancel,
  onReasonChange,
  order,
  reason,
}: {
  isCanceling: boolean
  isCancelling: boolean
  onCancel: () => void
  onOpenCancel: () => void
  onReasonChange: (value: string) => void
  order: OrderDetails
  reason: string
}) {
  const canCancel =
    order.status === 'PENDING' || order.status === 'IN_PREPARATION' || order.status === 'READY'

  return (
    <div className="mt-7 grid gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-xl bg-muted/50 p-4">
        <div>
          <p className="font-semibold">{order.customerName ?? 'Cliente não informado'}</p>
          {order.customerPhone ? (
            <p className="mt-1 text-sm text-muted-foreground">{order.customerPhone}</p>
          ) : null}
        </div>
        <span className="rounded-full bg-card px-3 py-1 text-sm font-medium">
          {statusLabel(order.status)}
        </span>
      </div>

      {order.cancellationType === 'ACCEPTANCE_TIMEOUT' ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Pedido cancelado automaticamente: não foi aceito em até 5 minutos.
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <DetailItem
          icon={order.serviceType === 'DELIVERY' ? Bike : Store}
          label="Recebimento"
          value={serviceLabel(order.serviceType)}
        />
        <DetailItem
          icon={CreditCard}
          label="Pagamento"
          value={paymentLabel(order.paymentMethod)}
        />
      </div>

      {order.serviceType === 'DELIVERY' ? <Address order={order} /> : null}

      <div>
        <h3 className="font-semibold">Itens do pedido</h3>
        <div className="mt-3 divide-y rounded-xl border border-border">
          {order.items.map((item) => (
            <article
              className="p-4"
              key={item.id}
            >
              <div className="flex justify-between gap-4">
                <div>
                  <p className="font-medium">
                    {item.quantity}× {item.productNameSnapshot}
                  </p>
                  {item.noteItem ? (
                    <p className="mt-1 text-sm text-muted-foreground">{item.noteItem}</p>
                  ) : null}
                  {item.orderModifierGroups.map((group) => (
                    <div
                      className="mt-2 text-sm text-muted-foreground"
                      key={group.id}
                    >
                      <p className="font-medium text-foreground">{group.groupNameSnapshot}</p>
                      {group.options.map((option) => (
                        <p key={option.id}>
                          {option.quantity}× {option.optionNameSnapshot}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
                <p className="shrink-0 font-medium text-primary">{formatCurrency(item.total)}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      {order.noteOrder ? (
        <p className="rounded-lg bg-muted px-4 py-3 text-sm">
          <span className="font-medium">Observação: </span>
          {order.noteOrder}
        </p>
      ) : null}

      <div className="flex items-center justify-between border-t border-border pt-5">
        <p className="text-lg font-semibold">
          Total <span className="text-primary">{formatCurrency(order.total)}</span>
        </p>
        {canCancel ? (
          <Button
            aria-label="Cancelar pedido"
            onClick={onOpenCancel}
            size="icon"
            title="Cancelar pedido"
            variant="destructive"
          >
            <Trash2 />
          </Button>
        ) : null}
      </div>

      {isCanceling ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <p className="font-medium">Cancelar pedido</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Informe o motivo do cancelamento para o cliente.
          </p>
          <Input
            className="mt-3"
            onChange={(event) => onReasonChange(event.target.value)}
            placeholder="Motivo do cancelamento"
            value={reason}
          />
          <div className="mt-3 flex justify-end gap-2">
            <Button
              disabled={isCancelling || !reason.trim()}
              onClick={onCancel}
              size="sm"
              variant="destructive"
            >
              {isCancelling ? <LoaderCircle className="animate-spin" /> : <Trash2 />} Confirmar
              cancelamento
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function Address({ order }: { order: OrderDetails }) {
  const location = [
    order.deliveryStreet &&
      `${order.deliveryStreet}${order.deliveryAddressNumber ? `, ${order.deliveryAddressNumber}` : ''}`,
    order.deliveryNeighborhood,
    order.deliveryCity,
    order.deliveryState,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <p className="rounded-lg border border-border px-4 py-3 text-sm">
      <span className="font-medium">Endereço: </span>
      {location || 'Não informado'}
      {order.deliveryComplement ? ` — ${order.deliveryComplement}` : ''}
    </p>
  )
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Bike
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border p-3">
      <Icon className="size-4 text-primary" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
function serviceLabel(value: OrderDetails['serviceType']) {
  return { DELIVERY: 'Entrega', PICKUP: 'Retirada', DINE_IN: 'No local' }[value]
}
function paymentLabel(value: OrderDetails['paymentMethod']) {
  return { PIX: 'Pix', CASH: 'Dinheiro', CARD: 'Cartão', OTHER: 'Outro' }[value]
}
function statusLabel(value: OrderStatus) {
  return {
    PENDING: 'Aguardando aceite',
    IN_PREPARATION: 'Em preparo',
    READY: 'Pronto',
    CANCELED: 'Cancelado',
    FINISHED: 'Finalizado',
  }[value]
}
