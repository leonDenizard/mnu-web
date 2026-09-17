'use client'

import Link from 'next/link'
import { ClipboardList, LogOut, Store, UtensilsCrossed } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuthSessionStore } from '@/features/auth/store/auth-session.store'

const navigation = [
  { href: '/kanban', label: 'Pedidos', icon: ClipboardList },
  { href: '/cardapio', label: 'Cardápio', icon: UtensilsCrossed },
  { href: '/loja', label: 'Loja', icon: Store }
]

export function DashboardNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const session = useAuthSessionStore((state) => state.session)
  const clearSession = useAuthSessionStore((state) => state.clearSession)

  function signOut() {
    clearSession()
    router.replace('/login')
  }

  const renderLinks = (compact = false) => navigation.map(({ href, label, icon: Icon }) => {
    const active = pathname === href || pathname.startsWith(`${href}/`)
    return <Link className={cn('flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors', active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground', compact && 'justify-center gap-1 px-2 py-2 text-xs')} href={href} key={href}><Icon className="size-4" aria-hidden="true" />{label}</Link>
  })

  return <>
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-border bg-card p-4 md:flex">
      <Link className="flex items-center gap-2 text-sm font-semibold text-primary" href="/kanban"><UtensilsCrossed className="size-5" aria-hidden="true" />mnu</Link>
      <nav className="mt-9 grid gap-1" aria-label="Navegação principal">{renderLinks()}</nav>
      <div className="mt-auto border-t border-border pt-4">
        <p className="truncate text-sm font-medium">{session?.user.storeName}</p>
        <p className="mt-1 truncate text-xs text-muted-foreground">{session?.user.email}</p>
        <Button className="mt-4 w-full justify-start" variant="ghost" onClick={signOut}><LogOut /> Sair</Button>
      </div>
    </aside>

    <header className="sticky top-0 z-20 border-b border-border bg-card/95 px-4 py-3 backdrop-blur md:hidden">
      <div className="flex items-center justify-between"><Link className="flex items-center gap-2 text-sm font-semibold text-primary" href="/kanban"><UtensilsCrossed className="size-5" aria-hidden="true" />mnu</Link><Button variant="ghost" size="icon" onClick={signOut} aria-label="Sair"><LogOut /></Button></div>
      <nav className="mt-3 grid grid-cols-3 gap-1" aria-label="Navegação principal">{renderLinks(true)}</nav>
    </header>
  </>
}
