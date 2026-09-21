'use client'

import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'

import type { CartSelection } from './product-selection-dialog'
import type { PublicMenuProduct } from '../schemas/public-menu.schema'

export type CartItem = { id: string; product: PublicMenuProduct; selections: CartSelection[]; quantity: number }

export function ShoppingCart({ items, onChangeQuantity, onRemove }: { items: CartItem[]; onChangeQuantity: (id: string, quantity: number) => void; onRemove: (id: string) => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const itemCount = items.reduce((total, item) => total + item.quantity, 0)
  const total = items.reduce((sum, item) => sum + ((item.product.promotionalPrice ?? item.product.price ?? 0) + item.selections.reduce((selectionTotal, selection) => selectionTotal + selection.option.price * selection.quantity, 0)) * item.quantity, 0)
  if (!items.length) return null

  return <><div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 p-3 backdrop-blur"><div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4"><button className="flex min-w-0 items-center gap-3 text-left" type="button" onClick={() => setIsOpen(true)}><span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"><ShoppingBag className="size-5" /></span><span className="min-w-0"><span className="block text-sm font-medium">{itemCount} {itemCount === 1 ? 'item' : 'itens'} no carrinho</span><span className="block text-xs text-muted-foreground">Toque para revisar</span></span></button><span className="font-semibold text-primary">{formatPrice(total)}</span></div></div>{isOpen && <div className="fixed inset-0 z-50 flex items-end bg-black/30 backdrop-blur-sm sm:items-center sm:justify-center sm:p-5" role="presentation"><section className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-card p-5 shadow-2xl sm:rounded-2xl" role="dialog" aria-modal="true" aria-labelledby="cart-title"><div className="flex items-center justify-between"><h2 className="text-lg font-semibold" id="cart-title">Seu carrinho</h2><Button size="icon-sm" variant="ghost" onClick={() => setIsOpen(false)} aria-label="Fechar carrinho"><X /></Button></div><div className="mt-5 grid gap-3">{items.map((item) => <article className="rounded-xl border border-border p-3" key={item.id}><div className="flex items-start justify-between gap-3"><div><p className="font-medium">{item.product.name}</p>{item.selections.map((selection) => <p className="mt-1 text-xs text-muted-foreground" key={`${selection.groupName}-${selection.option.id}`}>{selection.groupName}: {selection.option.name} × {selection.quantity}</p>)}</div><Button size="icon-sm" variant="ghost" onClick={() => onRemove(item.id)} aria-label={`Remover ${item.product.name}`}><Trash2 className="text-destructive" /></Button></div><div className="mt-3 flex items-center justify-between"><div className="flex items-center gap-2"><Button size="icon-xs" variant="outline" onClick={() => onChangeQuantity(item.id, item.quantity - 1)} aria-label="Diminuir quantidade"><Minus /></Button><span className="w-5 text-center text-sm">{item.quantity}</span><Button size="icon-xs" variant="outline" onClick={() => onChangeQuantity(item.id, item.quantity + 1)} aria-label="Aumentar quantidade"><Plus /></Button></div><span className="font-medium text-primary">{formatPrice(((item.product.promotionalPrice ?? item.product.price ?? 0) + item.selections.reduce((sum, selection) => sum + selection.option.price * selection.quantity, 0)) * item.quantity)}</span></div></article>)}</div><div className="mt-5 flex items-center justify-between border-t border-border pt-4"><span className="font-medium">Total</span><span className="text-lg font-semibold text-primary">{formatPrice(total)}</span></div><Button className="mt-4 w-full" disabled>Finalizar pedido em breve</Button></section></div>}</>
}

function formatPrice(value: number) { return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }
