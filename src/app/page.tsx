import Link from 'next/link'
import { ArrowRight, Utensils } from 'lucide-react'

import { Button, buttonVariants } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-stone-50 text-stone-950">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2 font-semibold"><Utensils className="size-5 text-violet-600" /> mnu</div>
        <Link className={buttonVariants({ variant: "ghost" })} href="/login">Entrar</Link>
      </header>
      <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 py-20 md:py-32">
        <p className="mb-5 text-sm font-medium text-violet-700">CARDÁPIO, PEDIDOS E OPERAÇÃO</p>
        <h1 className="max-w-3xl text-5xl font-semibold tracking-tight md:text-7xl">Seu cardápio digital, sem complicar a operação.</h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-stone-600">Crie sua loja, organize o cardápio e acompanhe cada pedido em um só lugar.</p>
        <div className="mt-10 flex flex-wrap gap-3"><Link className={buttonVariants({ size: "lg" })} href="/onboarding">Criar minha loja <ArrowRight /></Link><Button size="lg" variant="outline">Conhecer a plataforma</Button></div>
      </section>
    </main>
  )
}
