'use client'

import { FileSpreadsheet, LoaderCircle, Upload, UtensilsCrossed, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { useMenuImportViewModel } from '../view-models/use-menu-import-view-model'
import type { AnotaAiImportResult } from '../schemas/anota-ai-import.schema'

export function MenuImportView() {
  const { file, error, result, inputRef, isImporting, chooseFile, submit } =
    useMenuImportViewModel()

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12 sm:py-16">
      <header className="max-w-2xl">
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          <UtensilsCrossed
            className="size-4"
            aria-hidden="true"
          />
          mnu
        </div>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
          Gestor de cardápio
        </h1>
        <p className="mt-3 text-base leading-7 text-muted-foreground">
          Comece trazendo seu cardápio da Anota AI. Organizaremos categorias, produtos e adicionais
          a partir do arquivo exportado.
        </p>
      </header>

      <Card className="mt-10 max-w-3xl">
        <CardHeader>
          <CardTitle>Importar cardápio da Anota AI</CardTitle>
          <CardDescription>
            Envie o arquivo exportado em formato .xlsx. O limite é de 5 MB.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <input
            ref={inputRef}
            id="anota-ai-file"
            className="sr-only"
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={(event) => chooseFile(event.target.files?.[0] ?? null)}
          />

          {file ? (
            <div className="flex items-center justify-between gap-4 rounded-xl border border-primary/25 bg-accent px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <FileSpreadsheet
                  className="size-5 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                type="button"
                onClick={() => chooseFile(null)}
                disabled={isImporting}
                aria-label="Remover arquivo"
              >
                <X aria-hidden="true" />
              </Button>
            </div>
          ) : (
            <label
              htmlFor="anota-ai-file"
              className="flex cursor-pointer flex-col items-center rounded-xl border border-dashed border-border px-6 py-10 text-center transition-colors hover:border-primary/50 hover:bg-accent/40"
            >
              <span className="flex size-11 items-center justify-center rounded-full bg-accent text-primary">
                <Upload
                  className="size-5"
                  aria-hidden="true"
                />
              </span>
              <span className="mt-4 text-sm font-medium">Selecione o arquivo .xlsx</span>
              <span className="mt-1 text-sm text-muted-foreground">Exportado pela Anota AI</span>
            </label>
          )}

          {error && (
            <p
              className="mt-4 text-sm text-destructive"
              role="alert"
            >
              {error}
            </p>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-muted-foreground">
              A importação só adiciona itens e não altera cardápios existentes.
            </p>
            <Button
              type="button"
              size="lg"
              onClick={submit}
              disabled={!file || isImporting}
            >
              {isImporting ? (
                <>
                  <LoaderCircle
                    className="animate-spin"
                    aria-hidden="true"
                  />{' '}
                  Importando…
                </>
              ) : (
                'Importar cardápio'
              )}
            </Button>
          </div>

          {result && <ImportSuccess result={result} />}
        </CardContent>
      </Card>
    </main>
  )
}

function ImportSuccess({ result }: { result: AnotaAiImportResult }) {
  const items = [
    `${result.categories} ${result.categories === 1 ? 'categoria' : 'categorias'}`,
    `${result.products} ${result.products === 1 ? 'produto' : 'produtos'}`,
    `${result.modifierGroups} ${result.modifierGroups === 1 ? 'grupo de adicional' : 'grupos de adicionais'}`,
    `${result.modifierOptions} ${result.modifierOptions === 1 ? 'opção' : 'opções'}`,
  ]

  return (
    <div
      className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950"
      role="status"
    >
      <p className="font-medium">Cardápio importado com sucesso.</p>
      <p className="mt-1 text-emerald-800">
        Foram criados {items.join(', ')} e {result.productModifierGroups} vínculo(s) com adicionais.
      </p>
    </div>
  )
}

function formatFileSize(bytes: number) {
  return `${(bytes / 1024 / 1024).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} MB`
}
