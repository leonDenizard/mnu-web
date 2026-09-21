'use client'

import { CheckCircle2, LoaderCircle, X } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { createPublicOrder } from '../api/public-orders.api'
import type { CartItem } from './shopping-cart'

type PublicCheckoutProps = { slug: string; items: CartItem[]; supportsDelivery: boolean; supportsPickup: boolean; supportsDineIn: boolean; onClose: () => void; onSuccess: () => void }

export function PublicCheckout({ slug, items, supportsDelivery, supportsPickup, supportsDineIn, onClose, onSuccess }: PublicCheckoutProps) {
  const initialService = supportsDelivery ? 'DELIVERY' : supportsPickup ? 'PICKUP' : 'DINE_IN'
  const [serviceType, setServiceType] = useState<'DELIVERY' | 'PICKUP' | 'DINE_IN'>(initialService)
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'CASH' | 'CARD'>('PIX')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orderNumber, setOrderNumber] = useState<number | null>(null)
  const [form, setForm] = useState({ name: '', phone: '', street: '', number: '', neighborhood: '', city: '', state: '', zipCode: '', complement: '' })
  const services = [{ value: 'DELIVERY' as const, label: 'Entrega', enabled: supportsDelivery }, { value: 'PICKUP' as const, label: 'Retirada', enabled: supportsPickup }, { value: 'DINE_IN' as const, label: 'No local', enabled: supportsDineIn }].filter((service) => service.enabled)

  async function submit() {
    if (!form.name.trim() || !form.phone.trim()) return setError('Informe seu nome e telefone.')
    if (serviceType === 'DELIVERY' && (!form.street || !form.number || !form.neighborhood || !form.city || !form.state || !form.zipCode)) return setError('Informe todos os dados de entrega.')
    setIsSubmitting(true); setError(null)
    try {
      const result = await createPublicOrder(slug, { customerName: form.name.trim(), customerPhone: form.phone.trim(), serviceType, paymentMethod, ...(serviceType === 'DELIVERY' ? { deliveryStreet: form.street, deliveryAddressNumber: Number(form.number), deliveryNeighborhood: form.neighborhood, deliveryCity: form.city, deliveryState: form.state, deliveryZipCode: form.zipCode, deliveryComplement: form.complement || undefined } : {}), items: items.map((item) => ({ productId: item.product.id, quantity: item.quantity, orderModifierGroups: Object.values(item.selections.reduce<Record<string, { modifierGroupId: string; options: Array<{ modifierOptionId: string; quantity: number }> }>>((groups, selection) => ({ ...groups, [selection.groupId]: { modifierGroupId: selection.groupId, options: [...(groups[selection.groupId]?.options ?? []), { modifierOptionId: selection.option.id, quantity: selection.quantity }] } }), {})) })) })
      setOrderNumber(result.orderNumber)
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível enviar o pedido.') } finally { setIsSubmitting(false) }
  }

  if (orderNumber) return <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-5 backdrop-blur-sm"><section className="w-full max-w-md rounded-2xl bg-card p-6 text-center shadow-2xl"><CheckCircle2 className="mx-auto size-12 text-emerald-600" /><h2 className="mt-4 text-xl font-semibold">Pedido enviado!</h2><p className="mt-2 text-sm text-muted-foreground">Seu pedido #{orderNumber} já entrou na fila da loja.</p><Button className="mt-6 w-full" onClick={onSuccess}>Voltar ao cardápio</Button></section></div>

  return <div className="fixed inset-0 z-[60] flex items-end bg-black/30 backdrop-blur-sm sm:items-center sm:justify-center sm:p-5"><section className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-2xl bg-card p-5 shadow-2xl sm:rounded-2xl sm:p-6" role="dialog" aria-modal="true" aria-labelledby="checkout-title"><div className="flex items-center justify-between"><div><h2 className="text-xl font-semibold" id="checkout-title">Finalizar pedido</h2><p className="mt-1 text-sm text-muted-foreground">Preencha os dados para enviar à loja.</p></div><Button size="icon-sm" variant="ghost" onClick={onClose} aria-label="Fechar checkout"><X /></Button></div><div className="mt-6 grid gap-4"><label className="grid gap-1.5 text-sm font-medium">Seu nome<Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label className="grid gap-1.5 text-sm font-medium">Telefone<Input type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="(00) 00000-0000" /></label><div><p className="text-sm font-medium">Como deseja receber?</p><div className="mt-2 grid grid-cols-3 gap-2">{services.map((service) => <Button key={service.value} variant={serviceType === service.value ? 'default' : 'outline'} onClick={() => setServiceType(service.value)}>{service.label}</Button>)}</div></div><div><p className="text-sm font-medium">Forma de pagamento</p><div className="mt-2 grid grid-cols-3 gap-2">{([['PIX', 'Pix'], ['CARD', 'Cartão'], ['CASH', 'Dinheiro']] as const).map(([value, label]) => <Button key={value} variant={paymentMethod === value ? 'default' : 'outline'} onClick={() => setPaymentMethod(value)}>{label}</Button>)}</div></div>{serviceType === 'DELIVERY' && <div className="grid gap-3 rounded-xl bg-muted/50 p-4 sm:grid-cols-2"><label className="grid gap-1 text-sm sm:col-span-2">Rua<Input value={form.street} onChange={(event) => setForm({ ...form, street: event.target.value })} /></label><label className="grid gap-1 text-sm">Número<Input type="number" value={form.number} onChange={(event) => setForm({ ...form, number: event.target.value })} /></label><label className="grid gap-1 text-sm">Bairro<Input value={form.neighborhood} onChange={(event) => setForm({ ...form, neighborhood: event.target.value })} /></label><label className="grid gap-1 text-sm">Cidade<Input value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} /></label><label className="grid gap-1 text-sm">Estado<Input value={form.state} onChange={(event) => setForm({ ...form, state: event.target.value })} /></label><label className="grid gap-1 text-sm">CEP<Input value={form.zipCode} onChange={(event) => setForm({ ...form, zipCode: event.target.value })} /></label><label className="grid gap-1 text-sm sm:col-span-2">Complemento (opcional)<Input value={form.complement} onChange={(event) => setForm({ ...form, complement: event.target.value })} /></label></div>}{error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}<Button disabled={isSubmitting} onClick={submit}>{isSubmitting && <LoaderCircle className="animate-spin" />}Enviar pedido</Button></div></section></div>
}
