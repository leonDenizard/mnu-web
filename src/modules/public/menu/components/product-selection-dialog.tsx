'use client'

/* eslint-disable @next/next/no-img-element -- Menu images are external URLs configured by each store. */

import { ChevronLeft, ChevronRight, Minus, Plus, Store, X } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'

import { Button } from '@/components/ui/button'

import type { PublicMenuOption, PublicMenuProduct } from '../schemas/public-menu.schema'

export type CartSelection = { groupId: string; groupName: string; option: PublicMenuOption; quantity: number }

type ProductSelectionDialogProps = { product: PublicMenuProduct; onClose: () => void; onAdd: (product: PublicMenuProduct, selections: CartSelection[], quantity: number) => void }

export function ProductSelectionDialog({ product, onClose, onAdd }: ProductSelectionDialogProps) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, Record<string, number>>>({})
  const [productQuantity, setProductQuantity] = useState(1)
  const [currentStep, setCurrentStep] = useState(0)
  const groups = product.modifierGroups
  const currentGroup = groups[currentStep]
  const selected = useMemo(() => groups.flatMap((group) => group.options.filter((option) => (selectedOptions[group.id]?.[option.id] ?? 0) > 0).map((option) => ({ groupId: group.id, groupName: group.name, option, quantity: selectedOptions[group.id][option.id] }))), [groups, selectedOptions])
  const total = ((product.promotionalPrice ?? product.price ?? 0) + selected.reduce((sum, item) => sum + item.option.price * item.quantity, 0)) * productQuantity
  const selectedCount = currentGroup ? Object.values(selectedOptions[currentGroup.id] ?? {}).reduce((sum, quantity) => sum + quantity, 0) : 0
  const canContinue = !currentGroup || (selectedCount >= currentGroup.minSelections && selectedCount <= currentGroup.maxSelections)

  function changeOption(option: PublicMenuOption, delta: number) {
    if (!currentGroup) return
    const current = selectedOptions[currentGroup.id]?.[option.id] ?? 0
    const optionLimit = option.maxQuantity ?? currentGroup.maxSelections
    if (delta > 0 && (selectedCount >= currentGroup.maxSelections || current >= optionLimit)) return
    if (delta < 0 && current === 0) return
    setSelectedOptions((state) => ({ ...state, [currentGroup.id]: { ...state[currentGroup.id], [option.id]: current + delta } }))
  }

  function continueSelection() {
    if (!canContinue) return
    if (currentStep === groups.length - 1) return onAdd(product, selected, productQuantity)
    setCurrentStep((step) => step + 1)
  }

  if (!groups.length) return <ProductSetupScreen product={product} onClose={onClose}><div className="mx-auto flex w-full max-w-2xl flex-1 items-center justify-center px-5"><p className="text-center text-muted-foreground">Este item não possui adicionais.</p></div><CheckoutBar total={total} quantity={productQuantity} onQuantityChange={setProductQuantity} actionLabel="Adicionar ao carrinho" onAction={() => onAdd(product, [], productQuantity)} /></ProductSetupScreen>

  return <ProductSetupScreen product={product} onClose={onClose}><div className="min-h-0 flex-1 overflow-y-auto"><div className="mx-auto w-full max-w-2xl px-5 py-7 sm:px-6"><div className="flex gap-2" aria-label={`Etapa ${currentStep + 1} de ${groups.length}`}>{groups.map((group, index) => <span className={`h-1.5 flex-1 rounded-full transition-colors ${index <= currentStep ? 'bg-primary' : 'bg-muted'}`} key={group.id} />)}</div><div className="mt-7"><p className="text-sm font-medium text-primary">Etapa {currentStep + 1} de {groups.length}</p><div className="mt-2 flex items-start justify-between gap-4"><div><h2 className="text-2xl font-semibold tracking-tight">{currentGroup.name}</h2><p className="mt-2 text-sm text-muted-foreground">{currentGroup.required ? 'Escolha obrigatória' : 'Escolha opcional'} · selecione de {currentGroup.minSelections} a {currentGroup.maxSelections} opção(ões).</p></div><span className="shrink-0 rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">{selectedCount}/{currentGroup.maxSelections}</span></div><div className="mt-6 grid gap-3 pb-4">{currentGroup.options.map((option) => { const quantity = selectedOptions[currentGroup.id]?.[option.id] ?? 0; const optionLimit = option.maxQuantity ?? currentGroup.maxSelections; const canAdd = selectedCount < currentGroup.maxSelections && quantity < optionLimit; return <article className={`flex items-center gap-3 rounded-xl border p-3 transition-opacity ${quantity > 0 ? 'border-primary bg-primary/5' : 'border-border'} ${!canAdd && quantity === 0 ? 'opacity-50' : ''}`} key={option.id}>{option.image ? <img className="size-14 shrink-0 rounded-lg object-cover" src={option.image} alt="" /> : <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-primary"><Store className="size-5" /></div>}<div className="min-w-0 flex-1"><p className="font-medium">{option.name}</p>{option.description && <p className="mt-1 text-sm text-muted-foreground">{option.description}</p>}<p className="mt-1 text-sm text-primary">{option.price > 0 ? `+ ${formatPrice(option.price)}` : 'Incluso'}</p></div><QuantityControl quantity={quantity} canAdd={canAdd} onChange={(delta) => changeOption(option, delta)} /></article>})}</div></div></div></div><CheckoutBar total={total} quantity={productQuantity} onQuantityChange={setProductQuantity} actionLabel={currentStep === groups.length - 1 ? 'Adicionar ao carrinho' : 'Próxima etapa'} disabled={!canContinue} onBack={currentStep > 0 ? () => setCurrentStep((step) => step - 1) : undefined} onAction={continueSelection} /></ProductSetupScreen>
}

function ProductSetupScreen({ product, onClose, children }: { product: PublicMenuProduct; onClose: () => void; children: ReactNode }) {
  return <div className="fixed inset-0 z-50 flex min-h-0 flex-col overflow-hidden bg-background" role="presentation"><header className="shrink-0 border-b border-border bg-card"><div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-4 px-5 py-4 sm:px-6"><div className="flex min-w-0 items-center gap-4">{product.image ? <img className="size-24 shrink-0 rounded-xl object-cover" src={product.image} alt="" /> : <div className="flex size-24 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-primary"><Store className="size-7" /></div>}<div className="min-w-0"><p className="truncate text-lg font-semibold">{product.name}</p><p className="mt-1 text-sm text-muted-foreground">Personalize seu pedido</p></div></div><Button size="icon-sm" variant="ghost" onClick={onClose} aria-label="Fechar"><X /></Button></div></header>{children}</div>
}

function CheckoutBar({ total, quantity, onQuantityChange, actionLabel, disabled, onBack, onAction }: { total: number; quantity: number; onQuantityChange: (quantity: number) => void; actionLabel: string; disabled?: boolean; onBack?: () => void; onAction: () => void }) {
  return <div className="shrink-0 border-t border-border bg-card p-4"><div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-4">{onBack ? <Button variant="ghost" onClick={onBack}><ChevronLeft />Voltar</Button> : <div />}<QuantityControl quantity={quantity} canAdd onChange={(delta) => onQuantityChange(Math.max(1, quantity + delta))} /><div><p className="text-xs text-muted-foreground">Total do item</p><p className="font-semibold text-primary">{formatPrice(total)}</p></div><Button disabled={disabled} onClick={onAction}>{actionLabel}{actionLabel === 'Próxima etapa' ? <ChevronRight /> : <Plus />}</Button></div></div>
}

function QuantityControl({ quantity, canAdd, onChange }: { quantity: number; canAdd: boolean; onChange: (delta: number) => void }) {
  return <div className="flex items-center gap-3"><Button size="icon" variant="outline" disabled={quantity === 0} onClick={() => onChange(-1)} aria-label="Diminuir quantidade"><Minus /></Button><span className="w-6 text-center text-base font-medium">{quantity}</span><Button size="icon" variant="outline" disabled={!canAdd} onClick={() => onChange(1)} aria-label="Aumentar quantidade"><Plus /></Button></div>
}

function formatPrice(value: number) { return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }
