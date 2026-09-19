/* eslint-disable @next/next/no-img-element -- Menu images are external URLs configured by each store. */

import { Bike, ChevronRight, MapPin, Store, UtensilsCrossed } from 'lucide-react'

import type { PublicMenu } from '../schemas/public-menu.schema'

export function PublicMenuView({ menu }: { menu: PublicMenu }) {
  const location = [menu.addressLine, menu.addressNumber, menu.neighborhood]
    .filter(Boolean)
    .join(', ')
  const availableServices = [
    menu.supportsDelivery && 'Entrega',
    menu.supportsPickup && 'Retirada',
    menu.supportsDineIn && 'No local',
  ].filter((service): service is string => Boolean(service))

  return (
    <main className="min-h-screen bg-background pb-16 text-foreground">
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
        <div className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-6 sm:py-10">
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
          className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur"
          aria-label="Categorias"
        >
          <div className="mx-auto flex w-full max-w-3xl gap-2 overflow-x-auto px-5 py-3 sm:px-6">
            {menu.categories.map((category) => (
              <a
                className="shrink-0 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground hover:border-primary/40 hover:text-primary"
                href={`#${category.id}`}
                key={category.id}
              >
                {category.title}
              </a>
            ))}
          </div>
        </nav>
      )}

      <div className="mx-auto w-full max-w-3xl px-5 pt-8 sm:px-6">
        {menu.categories.length === 0 ? (
          <EmptyMenu />
        ) : (
          menu.categories.map((category) => (
            <section
              className="mb-10 scroll-mt-20"
              id={category.id}
              key={category.id}
            >
              <h2 className="text-xl font-semibold tracking-tight">{category.title}</h2>
              <div className="mt-4 grid gap-3">
                {category.products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </main>
  )
}

function ProductCard({
  product,
}: {
  product: PublicMenu['categories'][number]['products'][number]
}) {
  const currentPrice = product.promotionalPrice ?? product.price

  return (
    <article className="flex gap-4 rounded-2xl border border-border bg-card p-3 shadow-sm">
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
    </article>
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
