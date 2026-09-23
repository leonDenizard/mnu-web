'use client'

import Link from 'next/link'
import { Check, Copy, ExternalLink, Store } from 'lucide-react'
import { useState } from 'react'

import { Button, buttonVariants } from '@/components/ui/button'
import { useAuthSessionStore } from '@/modules/auth/store/auth-session.store'
import { useCurrentStore } from '@/modules/store/hooks/use-current-store'

export function AppHeader() {
  const session = useAuthSessionStore((state) => state.session)
  const { data } = useCurrentStore()
  const [hasCopied, setHasCopied] = useState(false)
  const store = data?.data
  const slug = store?.slug ?? session?.user.slug
  const menuPath = `/menu/${slug}`

  async function copyMenuLink() {
    if (!slug) return

    await navigator.clipboard.writeText(`${window.location.origin}${menuPath}`)
    setHasCopied(true)
    window.setTimeout(() => setHasCopied(false), 1800)
  }

  return (
    <header className="border-b border-border bg-card/95 px-5 py-3 backdrop-blur sm:px-8 md:sticky md:top-0 md:z-10">
      <div className="flex min-h-8 items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Store
              className="size-4"
              aria-hidden="true"
            />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">
              {store?.name ?? session?.user.storeName}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              <span
                aria-label={
                  store
                    ? store.isOpen
                      ? 'Loja aberta'
                      : 'Loja fechada'
                    : 'Status da loja carregando'
                }
                className={`size-2 rounded-full ${store?.isOpen ? 'bg-emerald-500' : store ? 'bg-red-500' : 'bg-muted-foreground/40'}`}
              />
              {store ? (store.isOpen ? 'Loja aberta' : 'Loja fechada') : 'Carregando status'}
            </p>
          </div>
        </div>
        {slug ? (
          <div className="flex shrink-0 items-center gap-1">
            <Link
              className={buttonVariants({ size: 'sm', variant: 'ghost' })}
              href={menuPath}
              rel="noreferrer"
              target="_blank"
            >
              Meu cardápio <ExternalLink />
            </Link>
            <Button
              aria-label="Copiar link do cardápio"
              onClick={copyMenuLink}
              size="icon-sm"
              title="Copiar link do cardápio"
              variant="ghost"
            >
              {hasCopied ? <Check className="text-emerald-600" /> : <Copy />}
            </Button>
          </div>
        ) : null}
      </div>
    </header>
  )
}
