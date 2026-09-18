import { Store } from 'lucide-react'

export function StoreView() {
  return (
    <main className="px-5 py-8 sm:px-8">
      <p className="text-sm font-medium text-primary">Configurações</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Loja</h1>
      <div className="mt-8 max-w-2xl rounded-xl border border-dashed border-border bg-card p-8">
        <Store className="size-7 text-primary" />
        <h2 className="mt-4 text-lg font-semibold">Configurações da loja</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Aqui vamos reunir horário de funcionamento, modalidades de atendimento, endereço e dados
          públicos da sua loja.
        </p>
      </div>
    </main>
  )
}
