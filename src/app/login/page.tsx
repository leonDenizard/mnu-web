import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-50 px-6">
      <section className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-violet-700">MNU</p>
        <h1 className="mt-2 text-2xl font-semibold">Área da loja</h1>
        <p className="mt-3 text-sm leading-6 text-stone-600">
          A tela de login será o próximo passo do painel administrativo.
        </p>
        <Link className={`${buttonVariants({ className: "mt-6" })} w-full`} href="/onboarding">
          Criar minha loja
        </Link>
      </section>
    </main>
  )
}
