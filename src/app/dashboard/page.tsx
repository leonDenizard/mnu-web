'use client'

import { useAuthSessionStore } from '@/features/auth/store/auth-session.store'

export default function DashboardPage() {
  const session = useAuthSessionStore((state) => state.session)
  return <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-6"><div><p className="text-sm text-muted-foreground">Painel da loja</p><h1 className="mt-2 text-3xl font-semibold">Olá, {session?.user.name ?? 'cliente'}.</h1><p className="mt-3 text-muted-foreground">Sua loja foi criada. O próximo passo será configurar o cardápio.</p></div></main>
}
