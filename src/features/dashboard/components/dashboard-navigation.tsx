'use client'

import Link from 'next/link'
import { ChevronDown, ClipboardList, FileSpreadsheet, LogOut, Settings2, Store, UtensilsCrossed } from 'lucide-react'
import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuthSessionStore } from '@/features/auth/store/auth-session.store'

const navigation = [
  { href: '/kanban', label: 'Pedidos', icon: ClipboardList },
  { href: '/loja', label: 'Loja', icon: Store },
]

const menuNavigation = [
  { href: '/cardapio/configuracoes', label: 'Configurações do cardápio', icon: Settings2 },
  { href: '/cardapio/produtos', label: 'Gerenciador de produtos', icon: UtensilsCrossed },
  { href: '/cardapio/importacoes', label: 'Importar cardápio', icon: FileSpreadsheet },
]

export function DashboardNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const session = useAuthSessionStore((state) => state.session)
  const clearSession = useAuthSessionStore((state) => state.clearSession)
  const isMenuActive = pathname.startsWith('/cardapio')
  const [isMenuOpen, setIsMenuOpen] = useState(isMenuActive)

  function signOut() {
    clearSession()
    router.replace('/login')
  }

  const renderLinks = (compact = false) =>
    navigation.map(({ href, label, icon: Icon }) => {
      const active = pathname === href || pathname.startsWith(`${href}/`)
      return (
        <Link
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
            active
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-primary/5 hover:text-foreground',
            compact && 'justify-center gap-1 px-2 py-2 text-xs',
          )}
          href={href}
          key={href}
        >
          <Icon
            className="size-4"
            aria-hidden="true"
          />
          {label}
        </Link>
      )
    })

  const renderMenuNavigation = (compact = false) => (
    <div className={cn('grid gap-1', compact && 'col-span-3')}>
      <button
        className={cn(
          'flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors',
          isMenuActive
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-primary/5 hover:text-foreground',
          compact && 'justify-center gap-1 px-2 py-2 text-xs',
        )}
        type="button"
        aria-expanded={isMenuOpen || isMenuActive}
        onClick={() => setIsMenuOpen((open) => !open)}
      >
        <UtensilsCrossed
          className="size-4"
          aria-hidden="true"
        />
        Cardápio
        <ChevronDown
          className={cn(
            'ml-auto size-4 transition-transform',
            (isMenuOpen || isMenuActive) && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </button>
      {(isMenuOpen || isMenuActive) && (
        <div
          className={cn(
            'ml-5 grid gap-1 border-l border-border pl-3',
            compact && 'ml-0 border-l-0 pl-0',
          )}
        >
          {menuNavigation.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                  active
                    ? 'bg-primary/10 font-medium text-primary'
                    : 'text-muted-foreground hover:bg-primary/5 hover:text-foreground',
                  compact && 'justify-center px-2 text-xs',
                )}
                href={href}
                key={href}
              >
                <Icon
                  className="size-3.5 shrink-0"
                  aria-hidden="true"
                />
                <span className={cn(compact && 'sr-only')}>{label}</span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-border bg-card p-4 md:flex">
        <Link
          className="flex items-center gap-2 text-sm font-semibold text-primary"
          href="/kanban"
        >
          <UtensilsCrossed
            className="size-5"
            aria-hidden="true"
          />
          mnu
        </Link>
        <nav
          className="mt-9 grid gap-1"
          aria-label="Navegação principal"
        >
          {renderLinks()}
          {renderMenuNavigation()}
        </nav>
        <div className="mt-auto border-t border-border pt-4">
          <p className="truncate text-sm font-medium">{session?.user.storeName}</p>
          <p className="mt-1 truncate text-xs text-muted-foreground">{session?.user.email}</p>
          <Button
            className="mt-4 w-full justify-start"
            variant="ghost"
            onClick={signOut}
          >
            <LogOut /> Sair
          </Button>
        </div>
      </aside>

      <header className="sticky top-0 z-20 border-b border-border bg-card/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center justify-between">
          <Link
            className="flex items-center gap-2 text-sm font-semibold text-primary"
            href="/kanban"
          >
            <UtensilsCrossed
              className="size-5"
              aria-hidden="true"
            />
            mnu
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={signOut}
            aria-label="Sair"
          >
            <LogOut />
          </Button>
        </div>
        <nav
          className="mt-3 grid grid-cols-3 gap-1"
          aria-label="Navegação principal"
        >
          {renderLinks(true)}
          {renderMenuNavigation(true)}
        </nav>
      </header>
    </>
  )
}
