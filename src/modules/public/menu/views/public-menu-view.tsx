'use client'

/* eslint-disable @next/next/no-img-element -- Menu images are external URLs configured by each store. */

import { Bike, ChevronRight, MapPin, Store, UtensilsCrossed } from 'lucide-react'
import { useState } from 'react'

import { ProductSelectionDialog, type CartSelection } from '../components/product-selection-dialog'
import { PublicCheckout } from '../components/public-checkout'
import { ShoppingCart, type CartItem } from '../components/shopping-cart'
import type { PublicMenu, PublicMenuProduct } from '../schemas/public-menu.schema'

export function PublicMenuView({ menu }: { menu: PublicMenu }) {
  const [selectedProduct, setSelectedProduct] = useState<PublicMenuProduct | null>(null)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [activeCategoryId, setActiveCategoryId] = useState(menu.categories[0]?.id ?? null)
  const location = [menu.addressLine, menu.addressNumber, menu.neighborhood]
    .filter(Boolean)
    .join(', ')
  const availableServices = [
    menu.supportsDelivery && 'Entrega',
    menu.supportsPickup && 'Retirada',
    menu.supportsDineIn && 'No local',
  ].filter((service): service is string => Boolean(service))

  function addToCart(product: PublicMenuProduct, selections: CartSelection[], quantity: number) {
    setCartItems((items) => [...items, { id: crypto.randomUUID(), product, selections, quantity }])
    setSelectedProduct(null)
  }

  function changeQuantity(id: string, quantity: number) {
    setCartItems((items) => quantity < 1 ? items.filter((item) => item.id !== id) : items.map((item) => item.id === id ? { ...item, quantity } : item))
  }

  return (
    <main className="min-h-screen bg-background pb-28 text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-4 sm:px-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <UtensilsCrossed className="size-4" /> mnu
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${menu.isOpen ? 'bg-emerald-50 text-emerald-700' : 'border border-border bg-card text-muted-foreground'}`}
          >
            {menu.isOpen ? 'Aberto agora' : 'Fechado agora'}
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
        <nav className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur" aria-label="Categorias">
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
                    onSelect={() => setSelectedProduct(product)}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
      {selectedProduct && <ProductSelectionDialog product={selectedProduct} onClose={() => setSelectedProduct(null)} onAdd={addToCart} />}
      <ShoppingCart items={cartItems} onChangeQuantity={changeQuantity} onRemove={(id) => setCartItems((items) => items.filter((item) => item.id !== id))} onCheckout={() => setIsCheckoutOpen(true)} />
      {isCheckoutOpen && <PublicCheckout slug={menu.slug} items={cartItems} supportsDelivery={menu.supportsDelivery} supportsPickup={menu.supportsPickup} supportsDineIn={menu.supportsDineIn} onClose={() => setIsCheckoutOpen(false)} onSuccess={() => { setCartItems([]); setIsCheckoutOpen(false) }} />}
    </main>
  )
}

function ProductCard({
  product,
  onSelect,
}: {
  product: PublicMenu['categories'][number]['products'][number]
  onSelect: () => void
}) {
  const currentPrice = product.promotionalPrice ?? product.price

  return (
    <button className="flex w-full gap-4 rounded-2xl border border-border bg-card p-3 text-left shadow-sm transition-colors hover:border-primary/40" type="button" onClick={onSelect}>
      {product.image ? (
        <img
          alt=""
          className="size-24 shrink-0 rounded-xl object-cover sm:size-28"
          src={product.image}
        />
      ) : (
        <div className="flex size-24 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-primary sm:size-28">
          <Store
            className="size-7"
            aria-hidden="true"
          />
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col py-1">
        <h3 className="font-semibold leading-5">{product.name}</h3>
        {product.description && (
          <p className="mt-1 line-clamp-2 text-sm leading-5 text-stone-600">
            {product.description}
          </p>
        )}
        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
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
