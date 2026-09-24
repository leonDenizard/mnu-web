'use client'

/* eslint-disable @next/next/no-img-element -- Menu images are external URLs configured by each store. */

import { Bike, ChevronRight, MapPin, Store, UtensilsCrossed } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { ProductSelectionDialog, type CartSelection } from '../components/product-selection-dialog'
import { PublicCheckout } from '../components/public-checkout'
import { ShoppingCart, type CartItem } from '../components/shopping-cart'
import { usePublicStoreAvailability } from '../hooks/use-public-store-availability'
import type { PublicMenu, PublicMenuProduct } from '../schemas/public-menu.schema'

export function PublicMenuView({ menu }: { menu: PublicMenu }) {
  const [selectedProduct, setSelectedProduct] = useState<PublicMenuProduct | null>(null)
  const [editingItem, setEditingItem] = useState<CartItem | null>(null)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [hasRestoredCart, setHasRestoredCart] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [isCartHighlighted, setIsCartHighlighted] = useState(false)
  const [activeCategoryId, setActiveCategoryId] = useState(menu.categories[0]?.id ?? null)
  const handleStoreClosed = useCallback(() => {
    setSelectedProduct(null)
    setEditingItem(null)
    setIsCheckoutOpen(false)
  }, [])
  const isStoreOpen = usePublicStoreAvailability(menu.slug, menu.isOpen, handleStoreClosed)
  const cartStorageKey = `mnu:public-cart:${menu.slug}`
  const location = [menu.addressLine, menu.addressNumber, menu.neighborhood]
    .filter(Boolean)
    .join(', ')
  const availableServices = [
    menu.supportsDelivery && 'Entrega',
    menu.supportsPickup && 'Retirada',
    menu.supportsDineIn && 'No local',
  ].filter((service): service is string => Boolean(service))

  useEffect(() => {
    let restoredCart: CartItem[] = []

    try {
      const savedCart = window.localStorage.getItem(cartStorageKey)
      if (savedCart) restoredCart = parseCartItems(savedCart)
    } catch {
      restoredCart = []
    }

    const timeoutId = window.setTimeout(() => {
      setCartItems(restoredCart)
      setHasRestoredCart(true)
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [cartStorageKey])

  useEffect(() => {
    if (!hasRestoredCart) return

    try {
      if (cartItems.length) {
        window.localStorage.setItem(cartStorageKey, JSON.stringify(cartItems))
      } else {
        window.localStorage.removeItem(cartStorageKey)
      }
    } catch {
      // The cart remains usable when browser storage is unavailable.
    }
  }, [cartItems, cartStorageKey, hasRestoredCart])

  function addToCart(product: PublicMenuProduct, selections: CartSelection[], quantity: number) {
    setCartItems((items) =>
      editingItem
        ? items.map((item) =>
            item.id === editingItem.id ? { ...item, product, selections, quantity } : item,
          )
        : [...items, { id: createCartItemId(), product, selections, quantity }],
    )
    setSelectedProduct(null)
    setEditingItem(null)
    if (!editingItem) {
      setIsCartHighlighted(true)
      window.setTimeout(() => setIsCartHighlighted(false), 700)
    }
  }

  function changeQuantity(id: string, quantity: number) {
    setCartItems((items) =>
      quantity < 1
        ? items.filter((item) => item.id !== id)
        : items.map((item) => (item.id === id ? { ...item, quantity } : item)),
    )
  }

  return (
    <main className="min-h-screen bg-background pb-28 text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-4 sm:px-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <UtensilsCrossed className="size-4" /> mnu
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${isStoreOpen ? 'bg-emerald-50 text-emerald-700' : 'border border-border bg-card text-muted-foreground'}`}
          >
            {isStoreOpen ? 'Aberto agora' : 'Fechado agora'}
          </span>
        </div>
      </header>

      <section className="border-b border-border bg-card">
        <div className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-6 sm:py-10">
          <p className="text-sm font-medium text-primary">Cardápio digital</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{menu.name}</h1>
          {location && (
            <p className="mt-3 flex items-center gap-2 text-sm text-stone-600">
              <MapPin className="size-4 shrink-0" />
              {location}
            </p>
          )}
          {availableServices.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {availableServices.map((service) => (
                <span
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground"
                  key={service}
                >
                  {service}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {menu.categories.length > 0 && (
        <nav
          className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur"
          aria-label="Categorias"
        >
          <div className="mx-auto flex w-full max-w-7xl gap-6 overflow-x-auto px-5 sm:px-6">
            {menu.categories.map((category) => (
              <a
                className={`shrink-0 border-b-2 px-1 py-4 text-sm font-medium transition-colors ${activeCategoryId === category.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:border-primary/30 hover:text-foreground'}`}
                href={`#${category.id}`}
                onClick={() => setActiveCategoryId(category.id)}
                key={category.id}
              >
                {category.title}
              </a>
            ))}
          </div>
        </nav>
      )}

      <div className="mx-auto w-full max-w-7xl px-5 pt-8 sm:px-6">
        {menu.categories.length === 0 ? (
          <EmptyMenu />
        ) : (
          menu.categories.map((category) => (
            <section
              className="mb-12 scroll-mt-20"
              id={category.id}
              key={category.id}
            >
              <h2 className="text-xl font-semibold tracking-tight">{category.title}</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {category.products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isStoreOpen={isStoreOpen}
                    onSelect={() => setSelectedProduct(product)}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
      {selectedProduct && isStoreOpen && (
        <ProductSelectionDialog
          key={editingItem?.id ?? selectedProduct.id}
          product={selectedProduct}
          initialSelections={editingItem?.selections}
          initialQuantity={editingItem?.quantity}
          onClose={() => {
            setSelectedProduct(null)
            setEditingItem(null)
          }}
          onAdd={addToCart}
        />
      )}
      <ShoppingCart
        isStoreOpen={isStoreOpen}
        items={cartItems}
        pulse={isCartHighlighted}
        onChangeQuantity={changeQuantity}
        onEdit={(item) => {
          setEditingItem(item)
          setSelectedProduct(item.product)
        }}
        onRemove={(id) => setCartItems((items) => items.filter((item) => item.id !== id))}
        onCheckout={() => setIsCheckoutOpen(true)}
      />
      {isCheckoutOpen && (
        <PublicCheckout
          isStoreOpen={isStoreOpen}
          slug={menu.slug}
          items={cartItems}
          supportsDelivery={menu.supportsDelivery}
          supportsPickup={menu.supportsPickup}
          supportsDineIn={menu.supportsDineIn}
          onClose={() => setIsCheckoutOpen(false)}
          onSuccess={() => {
            setCartItems([])
            setIsCheckoutOpen(false)
          }}
        />
      )}
    </main>
  )
}

function ProductCard({
  product,
  isStoreOpen,
  onSelect,
}: {
  product: PublicMenu['categories'][number]['products'][number]
  isStoreOpen: boolean
  onSelect: () => void
}) {
  const currentPrice = product.promotionalPrice ?? product.price

  return (
    <button
      className="flex w-full gap-3 rounded-2xl border border-border bg-card p-3 text-left shadow-sm transition-colors hover:border-primary/40 disabled:cursor-not-allowed disabled:opacity-55 sm:gap-4"
      disabled={!isStoreOpen}
      type="button"
      onClick={onSelect}
    >
      {product.image ? (
        <img
          alt=""
          className="min-h-24 w-24 shrink-0 self-stretch rounded-xl object-cover sm:min-h-28 sm:w-28"
          src={product.image}
        />
      ) : (
        <div className="flex min-h-24 w-24 shrink-0 self-stretch items-center justify-center rounded-xl bg-violet-50 text-primary sm:min-h-28 sm:w-28">
          <Store
            className="size-7"
            aria-hidden="true"
          />
        </div>
      )}
      <div className="flex min-h-24 min-w-0 flex-1 flex-col py-0.5 sm:min-h-28 sm:py-1">
        <h3 className="font-semibold leading-5">{product.name}</h3>
        {product.description && (
          <p className="mt-1 line-clamp-2 text-xs leading-4 text-stone-500 sm:text-sm sm:leading-5">
            {product.description}
          </p>
        )}
        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <div>
            {product.promotionalPrice !== null && product.price !== null && (
              <p className="text-xs text-stone-400 line-through">{formatPrice(product.price)}</p>
            )}
            {currentPrice !== null && (
              <p className="text-sm font-semibold text-primary">{formatPrice(currentPrice)}</p>
            )}
          </div>
          <span className="flex size-8 items-center justify-center rounded-full bg-accent text-primary">
            <ChevronRight
              className="size-4"
              aria-hidden="true"
            />
          </span>
        </div>
      </div>
    </button>
  )
}

function EmptyMenu() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center">
      <Bike
        className="mx-auto size-7 text-stone-400"
        aria-hidden="true"
      />
      <h2 className="mt-4 font-semibold">Cardápio em preparação</h2>
      <p className="mt-2 text-sm text-stone-600">
        Em breve, você poderá fazer seu pedido por aqui.
      </p>
    </div>
  )
}

function formatPrice(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function createCartItemId() {
  if (typeof globalThis.crypto?.randomUUID === 'function') return globalThis.crypto.randomUUID()

  return `cart-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function parseCartItems(serializedCart: string): CartItem[] {
  try {
    const parsedCart: unknown = JSON.parse(serializedCart)
    if (!Array.isArray(parsedCart)) return []

    return parsedCart.filter(
      (item): item is CartItem =>
        typeof item === 'object' &&
        item !== null &&
        typeof item.id === 'string' &&
        typeof item.quantity === 'number' &&
        item.quantity > 0 &&
        'product' in item &&
        typeof item.product === 'object' &&
        item.product !== null &&
        Array.isArray(item.selections),
    )
  } catch {
    return []
  }
}
