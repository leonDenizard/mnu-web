'use client'

/* eslint-disable @next/next/no-img-element -- Menu images are external URLs configured by each store. */

import {
  ChevronUp,
  Minus,
  Pencil,
  Plus,
  ShoppingCart as CartIcon,
  Store,
  Trash2,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'

import type { CartSelection } from './product-selection-dialog'
import type { PublicMenuProduct } from '../schemas/public-menu.schema'

export type CartItem = {
  id: string
  product: PublicMenuProduct
  selections: CartSelection[]
  quantity: number
}

export function ShoppingCart({
  isStoreOpen,
  items,
  pulse,
  onChangeQuantity,
  onEdit,
  onRemove,
  onCheckout,
}: {
  isStoreOpen: boolean
  items: CartItem[]
  pulse: boolean
  onChangeQuantity: (id: string, quantity: number) => void
  onEdit: (item: CartItem) => void
  onRemove: (id: string) => void
  onCheckout: () => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [hasScrollableItems, setHasScrollableItems] = useState(false)
  const itemsListRef = useRef<HTMLDivElement>(null)
  const itemCount = items.reduce((total, item) => total + item.quantity, 0)
  const total = items.reduce(
    (sum, item) =>
      sum +
      ((item.product.promotionalPrice ?? item.product.price ?? 0) +
        item.selections.reduce(
          (selectionTotal, selection) =>
            selectionTotal + selection.option.price * selection.quantity,
          0,
        )) *
        item.quantity,
    0,
  )
  useEffect(() => {
    if (!isOpen || !items.length) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen, items.length])

  useEffect(() => {
    if (!isOpen) return

    const frame = window.requestAnimationFrame(() => {
      const list = itemsListRef.current
      setHasScrollableItems(Boolean(list && list.scrollHeight > list.clientHeight))
    })

    return () => window.cancelAnimationFrame(frame)
  }, [isOpen, items])

  if (!items.length) return null

  function openCart() {
    setIsClosing(false)
    setIsOpen(true)
  }

  function closeCart(onClosed?: () => void) {
    setIsClosing(true)
    window.setTimeout(() => {
      setIsOpen(false)
      setIsClosing(false)
      onClosed?.()
    }, 180)
  }

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 p-3 backdrop-blur">
        <div className="mx-auto w-full max-w-3xl">
          <button
            aria-controls="shopping-cart-sheet"
            aria-expanded={isOpen}
            aria-haspopup="dialog"
            aria-label={`Abrir carrinho com ${itemCount} ${itemCount === 1 ? 'item' : 'itens'}`}
            className="flex w-full items-center gap-3 rounded-xl bg-primary px-4 py-3 text-left text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98]"
            type="button"
            onClick={openCart}
          >
            <span
              className={`relative flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15 ${pulse ? 'motion-safe:animate-bounce' : ''}`}
            >
              <CartIcon
                className="size-5"
                aria-hidden="true"
              />
              <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-card text-xs font-bold text-primary shadow-sm">
                {itemCount}
              </span>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">Ver carrinho</span>
              <span className="block text-xs text-primary-foreground/75">
                {itemCount} {itemCount === 1 ? 'item selecionado' : 'itens selecionados'}
              </span>
            </span>
            <span className="text-right">
              <span className="block font-semibold">{formatPrice(total)}</span>
              <ChevronUp
                className="ml-auto mt-0.5 size-4"
                aria-hidden="true"
              />
            </span>
          </button>
        </div>
      </div>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/15 backdrop-blur-[1px]"
            aria-hidden="true"
            onClick={() => closeCart()}
          />
          <div
            className={`fixed inset-x-0 bottom-0 z-50 max-h-[80dvh] rounded-t-3xl border-t border-border bg-card shadow-[0_-18px_45px_rgb(28_25_23_/_0.14)] ${isClosing ? 'animate-out slide-out-to-bottom-5 duration-200' : 'animate-in slide-in-from-bottom-5 duration-200'}`}
          >
            <section
              className="grid max-h-[80dvh] w-full grid-rows-[auto_minmax(0,1fr)_auto]"
              id="shopping-cart-sheet"
              role="dialog"
              aria-modal="true"
              aria-labelledby="cart-title"
            >
              <div className="mx-auto w-full max-w-3xl px-5 pt-2 sm:px-6">
                <button
                  aria-label="Fechar carrinho"
                  className="mx-auto mb-1 flex h-8 w-full items-center justify-center"
                  type="button"
                  onClick={() => closeCart()}
                >
                  <span className="h-1.5 w-12 rounded-full bg-muted-foreground/30" />
                </button>
                <div className="flex items-center justify-between">
                  <h2
                    className="text-lg font-semibold"
                    id="cart-title"
                  >
                    Seu carrinho
                  </h2>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => closeCart()}
                    aria-label="Fechar carrinho"
                  >
                    <X />
                  </Button>
                </div>
                {!isStoreOpen && (
                  <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    A loja está fechada no momento. Não é possível finalizar o pedido.
                  </p>
                )}
              </div>
              <div
                className="min-h-0 overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                ref={itemsListRef}
              >
                <div className="mx-auto grid w-full max-w-3xl gap-3 px-5 py-5 sm:px-6">
                  {items.map((item) => (
                    <article
                      className="px-1 py-2"
                      key={item.id}
                    >
                      <div className="flex gap-3">
                        {item.product.image ? (
                          <img
                            alt=""
                            className="size-14 shrink-0 rounded-xl object-cover"
                            src={item.product.image}
                          />
                        ) : (
                          <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-primary">
                            <Store
                              className="size-5"
                              aria-hidden="true"
                            />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <p className="font-medium">{item.product.name}</p>
                            <div className="flex shrink-0 items-center gap-1">
                              <Button
                                size="icon-sm"
                                variant="ghost"
                                onClick={() => onEdit(item)}
                                aria-label={`Editar ${item.product.name}`}
                              >
                                <Pencil />
                              </Button>
                              <Button
                                size="icon-sm"
                                variant="ghost"
                                onClick={() => onRemove(item.id)}
                                aria-label={`Remover ${item.product.name}`}
                              >
                                <Trash2 className="text-destructive" />
                              </Button>
                            </div>
                          </div>
                          {groupSelections(item.selections).length > 0 && (
                            <div className="mt-3 grid gap-3 pl-4">
                              {groupSelections(item.selections).map((group) => (
                                <div key={group.id}>
                                  <p className="text-xs font-semibold text-foreground">
                                    {group.name}
                                  </p>
                                  <div className="mt-1 grid gap-1 pl-4">
                                    {group.options.map((selection) => (
                                      <p
                                        className="text-xs text-muted-foreground"
                                        key={selection.option.id}
                                      >
                                        <span className="font-semibold text-foreground">
                                          {selection.quantity}×
                                        </span>{' '}
                                        {selection.option.name}
                                      </p>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                size="icon-xs"
                                variant="outline"
                                onClick={() => onChangeQuantity(item.id, item.quantity - 1)}
                                aria-label="Diminuir quantidade"
                              >
                                <Minus />
                              </Button>
                              <span className="w-5 text-center text-sm">{item.quantity}</span>
                              <Button
                                size="icon-xs"
                                variant="outline"
                                onClick={() => onChangeQuantity(item.id, item.quantity + 1)}
                                aria-label="Aumentar quantidade"
                              >
                                <Plus />
                              </Button>
                            </div>
                            <span className="font-medium text-primary">
                              {formatPrice(
                                ((item.product.promotionalPrice ?? item.product.price ?? 0) +
                                  item.selections.reduce(
                                    (sum, selection) =>
                                      sum + selection.option.price * selection.quantity,
                                    0,
                                  )) *
                                  item.quantity,
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
              <div
                className={`relative border-t border-border bg-card pb-5 pt-4 ${hasScrollableItems ? 'before:pointer-events-none before:absolute before:-top-8 before:inset-x-0 before:h-8 before:bg-gradient-to-t before:from-card before:to-transparent' : ''}`}
              >
                <div className="mx-auto w-full max-w-3xl px-5 sm:px-6">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Total</span>
                    <span className="text-lg font-semibold text-primary">{formatPrice(total)}</span>
                  </div>
                  <Button
                    className="mt-4 w-full"
                    disabled={!isStoreOpen}
                    onClick={() => closeCart(onCheckout)}
                  >
                    Finalizar pedido
                  </Button>
                </div>
              </div>
            </section>
          </div>
        </>
      )}
    </>
  )
}

function formatPrice(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function groupSelections(selections: CartSelection[]) {
  const groups = new Map<string, { id: string; name: string; options: CartSelection[] }>()

  for (const selection of selections) {
    const group = groups.get(selection.groupId)
    if (group) {
      group.options.push(selection)
    } else {
      groups.set(selection.groupId, {
        id: selection.groupId,
        name: selection.groupName,
        options: [selection],
      })
    }
  }

  return [...groups.values()]
}
