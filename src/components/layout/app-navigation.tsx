'use client'

import Link from 'next/link'
import {
  BarChart3,
  Clock3,
  ChevronDown,
  ClipboardList,
  FileSpreadsheet,
  LogOut,
  Settings2,
  Store,
  UtensilsCrossed,
} from 'lucide-react'
import { useState, type ComponentType } from 'react'
import { usePathname, useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuthSessionStore } from '@/modules/auth/store/auth-session.store'

type NavigationItem = {
  href: string
  label: string
  icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>
}

const mainNavigation: NavigationItem[] = [
  { href: '/kanban', label: 'Pedidos', icon: ClipboardList },
]

const storeNavigation: NavigationItem[] = [
  { href: '/loja', label: 'Configurações', icon: Settings2 },
  { href: '/loja/horarios', label: 'Horários', icon: Clock3 },
]

const menuNavigation: NavigationItem[] = [
  { href: '/cardapio/configuracoes', label: 'Gerenciar cardápio', icon: Settings2 },
  { href: '/cardapio/importacoes', label: 'Importar cardápio', icon: FileSpreadsheet },
]

const reportsNavigation: NavigationItem[] = [
  { href: '/relatorios/pedidos', label: 'Relatório de pedidos', icon: ClipboardList },
]

export function AppNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const session = useAuthSessionStore((state) => state.session)
  const clearSession = useAuthSessionStore((state) => state.clearSession)
  const isMenuActive = pathname.startsWith('/cardapio')
  const isReportsActive = pathname.startsWith('/relatorios')
  const isStoreActive = pathname === '/loja' || pathname.startsWith('/loja/')
  const [isMenuOpen, setIsMenuOpen] = useState(isMenuActive)
  const [isReportsOpen, setIsReportsOpen] = useState(isReportsActive)
  const [isStoreOpen, setIsStoreOpen] = useState(isStoreActive)

  function signOut() {
    clearSession()
    router.replace('/login')
  }

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 flex-col border-r border-border/80 bg-[#fafaf9] px-5 py-6 md:flex">
        <Link
          className="flex items-center gap-3 px-1"
          href="/kanban"
        >
          <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <UtensilsCrossed
              className="size-5"
              aria-hidden="true"
            />
          </span>
          <span className="text-lg font-semibold tracking-tight">mnu</span>
        </Link>

        <nav
          className="mt-14 grid gap-2"
          aria-label="Navegação principal"
        >
          {mainNavigation.map((item) => (
            <SidebarLink
              active={isActive(pathname, item.href)}
              item={item}
              key={item.href}
            />
          ))}
          <NavigationGroup
            active={isStoreActive}
            icon={Store}
            isOpen={isStoreOpen}
            items={storeNavigation}
            label="Loja"
            onToggle={() => setIsStoreOpen((open) => !open)}
            pathname={pathname}
          />
          <NavigationGroup
            active={isMenuActive}
            isOpen={isMenuOpen}
            items={menuNavigation}
            label="Cardápio"
            onToggle={() => setIsMenuOpen((open) => !open)}
            pathname={pathname}
            icon={UtensilsCrossed}
          />
          <NavigationGroup
            active={isReportsActive}
            isOpen={isReportsOpen}
            items={reportsNavigation}
            label="Relatórios"
            onToggle={() => setIsReportsOpen((open) => !open)}
            pathname={pathname}
            icon={BarChart3}
          />
        </nav>

        <div className="mt-auto rounded-2xl border border-border/80 bg-card p-3 shadow-sm">
          <p className="truncate text-sm font-semibold">{session?.user.storeName}</p>
          <p className="mt-1 truncate text-xs text-muted-foreground">{session?.user.email}</p>
          <Button
            className="mt-3 w-full justify-start"
            onClick={signOut}
            size="sm"
            variant="ghost"
          >
            <LogOut /> Sair
          </Button>
        </div>
      </aside>

      <header className="sticky top-0 z-20 border-b border-border bg-card/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center justify-between gap-3">
          <Link
            className="flex items-center gap-2 text-sm font-semibold text-primary"
            href="/kanban"
          >
            <UtensilsCrossed
              className="size-5"
              aria-hidden="true"
            />{' '}
            mnu
          </Link>
          <Button
            aria-label="Sair"
            onClick={signOut}
            size="icon"
            variant="ghost"
          >
            <LogOut />
          </Button>
        </div>
        <nav
          className="mt-4 flex gap-1 overflow-x-auto pb-1"
          aria-label="Navegação principal"
        >
          {[...mainNavigation, ...storeNavigation, ...menuNavigation, ...reportsNavigation].map(
            (item) => (
              <Link
                className={cn(
                  'flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium',
                  isActive(pathname, item.href)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground',
                )}
                href={item.href}
                key={item.href}
              >
                <item.icon className="size-3.5" /> {item.label}
              </Link>
            ),
          )}
        </nav>
      </header>
    </>
  )
}

function SidebarLink({ active, item }: { active: boolean; item: NavigationItem }) {
  const Icon = item.icon
  return (
    <Link
      className={cn(
        'flex h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors',
        active
          ? 'bg-card text-primary shadow-[0_5px_14px_rgb(28_25_23_/_0.08)]'
          : 'text-muted-foreground hover:bg-card hover:text-foreground',
      )}
      href={item.href}
    >
      <Icon className="size-5" />
      {item.label}
    </Link>
  )
}

function NavigationGroup({
  active,
  icon: Icon,
  isOpen,
  items,
  label,
  onToggle,
  pathname,
}: {
  active: boolean
  icon: NavigationItem['icon']
  isOpen: boolean
  items: NavigationItem[]
  label: string
  onToggle: () => void
  pathname: string
}) {
  return (
    <div className="mt-1">
      <button
        aria-expanded={isOpen}
        className={cn(
          'flex h-12 w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-left text-sm font-medium transition-colors',
          active ? 'text-primary' : 'text-muted-foreground hover:bg-card hover:text-foreground',
        )}
        onClick={onToggle}
        type="button"
      >
        <Icon className="size-5" />
        {label}
        <ChevronDown
          className={cn('ml-auto size-4 transition-transform', isOpen && 'rotate-180')}
          aria-hidden="true"
        />
      </button>
      {isOpen ? (
        <div className="relative ml-5 mt-1 grid gap-1 py-1 pl-6 before:absolute before:inset-y-1 before:left-0 before:w-[2px] before:bg-border">
          {items.map((item) => {
            const itemActive = isActive(pathname, item.href)
            return (
              <Link
                className={cn(
                  'relative flex min-h-11 items-center rounded-xl px-3 text-sm font-medium transition-colors',
                  itemActive
                    ? 'bg-card text-primary shadow-[0_5px_14px_rgb(28_25_23_/_0.08)]'
                    : 'text-muted-foreground hover:bg-card hover:text-foreground',
                )}
                href={item.href}
                key={item.href}
              >
                <span className="pointer-events-none absolute -left-6 top-1/2 h-[26px] w-6 -translate-y-6 overflow-hidden">
                  <svg
                    aria-hidden="true"
                    className="h-6 w-7 overflow-visible text-border"
                    fill="none"
                    viewBox="0 0 28 24"
                  >
                    <path
                      d="M1 -1v11c0 7.7 6.3 14 14 14h13"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                </span>
                {item.label}
              </Link>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

function isActive(pathname: string, href: string) {
  if (href === '/loja') return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}
