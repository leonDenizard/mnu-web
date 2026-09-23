'use client'

import { ChevronLeft, ChevronRight, LoaderCircle } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { useOrderReport } from '../hooks/use-order-report'
import type { OrderStatus } from '../schemas/orders.schema'

const statusFilters: Array<{ label: string; value?: OrderStatus }> = [
  { label: 'Todos' },
  { label: 'Aguardando aceite', value: 'PENDING' },
  { label: 'Em preparo', value: 'IN_PREPARATION' },
  { label: 'Prontos', value: 'READY' },
  { label: 'Finalizados', value: 'FINISHED' },
  { label: 'Cancelados', value: 'CANCELED' },
]

const statusLabels: Record<OrderStatus, string> = {
  PENDING: 'Aguardando aceite',
  IN_PREPARATION: 'Em preparo',
  READY: 'Pronto',
  FINISHED: 'Finalizado',
  CANCELED: 'Cancelado',
}

export function OrdersReportView() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<OrderStatus>()
  const { data, isError, isPending } = useOrderReport({ page, status })

  function changeStatus(nextStatus?: OrderStatus) {
    setStatus(nextStatus)
    setPage(1)
  }

  return (
    <main className="min-w-0 px-5 py-8 sm:px-8">
      <header>
        <p className="text-sm font-medium text-primary">Relatórios</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Relatório de pedidos</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Consulte os pedidos da sua loja por status.
        </p>
      </header>

      <div
        className="mt-8 flex flex-wrap gap-2"
        aria-label="Filtrar pedidos por status"
      >
        {statusFilters.map((filter) => (
          <Button
            key={filter.label}
            onClick={() => changeStatus(filter.value)}
            size="sm"
            variant={status === filter.value ? 'default' : 'outline'}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      <section className="mt-5 overflow-hidden rounded-xl border border-border bg-card">
        {isPending ? (
          <div className="flex min-h-64 items-center justify-center gap-2 text-sm text-muted-foreground">
            <LoaderCircle className="size-4 animate-spin" /> Carregando pedidos…
          </div>
        ) : isError ? (
          <p className="px-5 py-10 text-sm text-destructive">
            Não foi possível carregar o relatório.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Recebimento</TableHead>
                <TableHead className="hidden md:table-cell">Pagamento</TableHead>
                <TableHead className="hidden lg:table-cell">Criado em</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.length ? (
                data.data.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.orderNumber}</TableCell>
                    <TableCell>
                      <p>{order.customerName ?? 'Cliente não informado'}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.itemCount} {order.itemCount === 1 ? 'item' : 'itens'}
                      </p>
                    </TableCell>
                    <TableCell>{getStatusLabel(order.status, order.cancellationType)}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {serviceTypeLabel(order.serviceType)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {paymentMethodLabel(order.paymentMethod)}
                    </TableCell>
                    <TableCell className="hidden whitespace-nowrap lg:table-cell">
                      {formatDate(order.createdAt)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-primary">
                      {formatCurrency(order.total)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    className="h-36 text-center text-muted-foreground"
                    colSpan={7}
                  >
                    Nenhum pedido encontrado com este filtro.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </section>

      {data ? (
        <footer className="mt-4 flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">{data.meta.total} pedidos encontrados</p>
          <div className="flex items-center gap-2">
            <Button
              disabled={page === 1}
              onClick={() => setPage((current) => current - 1)}
              size="sm"
              variant="outline"
            >
              <ChevronLeft /> Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {page} de {data.meta.lastPage}
            </span>
            <Button
              disabled={page === data.meta.lastPage}
              onClick={() => setPage((current) => current + 1)}
              size="sm"
              variant="outline"
            >
              Próxima <ChevronRight />
            </Button>
          </div>
        </footer>
      ) : null}
    </main>
  )
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(
    new Date(value),
  )
}

function serviceTypeLabel(value: 'DELIVERY' | 'PICKUP' | 'DINE_IN') {
  return { DELIVERY: 'Entrega', PICKUP: 'Retirada', DINE_IN: 'Mesa' }[value]
}

function paymentMethodLabel(value: 'PIX' | 'CASH' | 'CARD' | 'OTHER') {
  return { PIX: 'Pix', CASH: 'Dinheiro', CARD: 'Cartão', OTHER: 'Outro' }[value]
}

function getStatusLabel(status: OrderStatus, cancellationType: string | null) {
  if (status === 'CANCELED' && cancellationType === 'ACCEPTANCE_TIMEOUT') return 'Não aceito'
  return statusLabels[status]
}
