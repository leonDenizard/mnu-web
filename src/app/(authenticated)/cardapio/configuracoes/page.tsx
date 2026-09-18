import { CircleHelp, ImagePlus, Power, Smartphone } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function MenuSettingsPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12 sm:py-16">
      <header className="max-w-2xl">
        <p className="text-sm font-semibold text-primary">Cardápio</p>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">Configurações do cardápio</h1>
        <p className="mt-3 text-base leading-7 text-muted-foreground">Defina como sua loja aparece para os clientes no cardápio digital.</p>
      </header>

      <div className="mt-10 grid max-w-3xl gap-5">
        <Card>
          <CardHeader>
            <CardTitle>Publicação</CardTitle>
            <CardDescription>Controle quando o cardápio fica disponível ao público.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-4 rounded-lg border border-border px-4 py-3">
              <div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground"><Power className="size-4" /></span><div><p className="text-sm font-medium">Cardápio ativo</p><p className="mt-1 text-xs text-muted-foreground">Publique ou pause o acesso ao seu cardápio.</p></div></div>
              <span title="Em breve: a publicação do cardápio será configurável."><Button disabled><CircleHelp /> Em breve</Button></span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Identidade visual</CardTitle>
            <CardDescription>Personalize a apresentação do seu cardápio.</CardDescription>
          </CardHeader>
          <CardContent>
            <label className="flex cursor-not-allowed items-center gap-4 rounded-lg border border-dashed border-border px-4 py-4 opacity-65" title="Em breve: envie a logo da sua loja.">
              <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground"><ImagePlus className="size-5" /></span>
              <span><span className="block text-sm font-medium">Logo do cardápio</span><span className="mt-1 block text-xs text-muted-foreground">Em breve: adicione uma imagem para identificar sua loja.</span></span>
              <Input className="sr-only" type="file" disabled />
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações para o cliente</CardTitle>
            <CardDescription>Escolha quais formas de contato aparecem no cardápio público.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <label className="flex cursor-not-allowed items-center justify-between gap-4 rounded-lg border border-border px-4 py-3 opacity-65" title="Em breve: controle a exibição do telefone no cardápio público.">
              <span className="flex items-center gap-3"><Smartphone className="size-4 text-muted-foreground" /><span><span className="block text-sm font-medium">Exibir telefone</span><span className="mt-1 block text-xs text-muted-foreground">Mostra o telefone da loja para os clientes.</span></span></span>
              <input type="checkbox" disabled aria-label="Exibir telefone" />
            </label>
            <label className="flex cursor-not-allowed items-center justify-between gap-4 rounded-lg border border-border px-4 py-3 opacity-65" title="Em breve: controle a exibição do WhatsApp no cardápio público.">
              <span className="flex items-center gap-3"><Smartphone className="size-4 text-muted-foreground" /><span><span className="block text-sm font-medium">Exibir WhatsApp</span><span className="mt-1 block text-xs text-muted-foreground">Mostra um atalho de conversa com sua loja.</span></span></span>
              <input type="checkbox" disabled aria-label="Exibir WhatsApp" />
            </label>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
