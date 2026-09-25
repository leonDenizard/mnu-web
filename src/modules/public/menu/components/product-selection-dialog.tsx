'use client'

/* eslint-disable @next/next/no-img-element -- Menu images are external URLs configured by each store. */

import { ChevronLeft, ChevronRight, Minus, Plus, Store, X } from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'

import { Button } from '@/components/ui/button'

import type { PublicMenuOption, PublicMenuProduct } from '../schemas/public-menu.schema'

export type CartSelection = {
  groupId: string
  groupName: string
  option: PublicMenuOption
  quantity: number
}

type ProductSelectionDialogProps = {
  product: PublicMenuProduct
  initialSelections?: CartSelection[]
  initialQuantity?: number
  onClose: () => void
  onAdd: (product: PublicMenuProduct, selections: CartSelection[], quantity: number) => void
}

export function ProductSelectionDialog({
  product,
  initialSelections = [],
  initialQuantity = 1,
  onClose,
  onAdd,
}: ProductSelectionDialogProps) {
  const [selectedOptions, setSelectedOptions] = useState(() =>
    createSelectedOptions(initialSelections),
  )
  const [productQuantity, setProductQuantity] = useState(initialQuantity)
  const [currentStep, setCurrentStep] = useState(0)
  const [isGroupDetailsCollapsed, setIsGroupDetailsCollapsed] = useState(false)
  const groups = product.modifierGroups
  const currentGroup = groups[currentStep]
  const selected = useMemo(
    () =>
      groups.flatMap((group) =>
        group.options
          .filter((option) => (selectedOptions[group.id]?.[option.id] ?? 0) > 0)
          .map((option) => ({
            groupId: group.id,
            groupName: group.name,
            option,
            quantity: selectedOptions[group.id][option.id],
          })),
      ),
    [groups, selectedOptions],
  )
  const total =
    ((product.promotionalPrice ?? product.price ?? 0) +
      selected.reduce((sum, item) => sum + item.option.price * item.quantity, 0)) *
    productQuantity
  const selectedCount = currentGroup
    ? Object.values(selectedOptions[currentGroup.id] ?? {}).reduce(
        (sum, quantity) => sum + quantity,
        0,
      )
    : 0
  const canContinue =
    !currentGroup ||
    (selectedCount >= currentGroup.minSelections && selectedCount <= currentGroup.maxSelections)

  function changeOption(option: PublicMenuOption, delta: number) {
    if (!currentGroup) return
    const current = selectedOptions[currentGroup.id]?.[option.id] ?? 0
    const optionLimit = option.maxQuantity ?? currentGroup.maxSelections
    if (delta > 0 && (selectedCount >= currentGroup.maxSelections || current >= optionLimit)) return
    if (delta < 0 && current === 0) return
    setSelectedOptions((state) => ({
      ...state,
      [currentGroup.id]: { ...state[currentGroup.id], [option.id]: current + delta },
    }))
  }

  function continueSelection() {
    if (!canContinue) return
    if (currentStep === groups.length - 1) return onAdd(product, selected, productQuantity)
    setIsGroupDetailsCollapsed(false)
    setCurrentStep((step) => step + 1)
  }

  if (!groups.length)
    return (
      <ProductSetupScreen
        product={product}
        onClose={onClose}
      >
        <div className="mx-auto flex w-full max-w-2xl flex-1 items-center justify-center px-5">
          <p className="text-center text-muted-foreground">Este item não possui adicionais.</p>
        </div>
        <CheckoutBar
          total={total}
          quantity={productQuantity}
          onQuantityChange={setProductQuantity}
          actionLabel="Adicionar ao carrinho"
          onAction={() => onAdd(product, [], productQuantity)}
        />
      </ProductSetupScreen>
    )

  return (
    <ProductSetupScreen
      product={product}
      onClose={onClose}
    >
      <div className="min-h-0 flex flex-1 flex-col">
        <div className="shrink-0">
          <div className="mx-auto w-full max-w-2xl px-5 py-5 sm:px-6">
            <div
              className="flex gap-2"
              aria-label={`Etapa ${currentStep + 1} de ${groups.length}`}
            >
              {groups.map((group) => {
                const groupSelectedCount = Object.values(selectedOptions[group.id] ?? {}).reduce(
                  (sum, quantity) => sum + quantity,
                  0,
                )

                return (
                  <span
                    className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted-foreground/20"
                    key={group.id}
                  >
                    <span
                      className="block h-full origin-left rounded-full bg-primary transition-transform duration-200"
                      style={{
                        transform: `scaleX(${getGroupProgress(groupSelectedCount, group.maxSelections)})`,
                      }}
                    />
                  </span>
                )
              })}
            </div>
            <div
              className={`overflow-hidden transition-[max-height,margin,opacity] duration-200 sm:mt-5 sm:max-h-none sm:opacity-100 ${isGroupDetailsCollapsed ? 'max-h-0 opacity-0' : 'mt-4 max-h-40 opacity-100'}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    {currentGroup.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {currentGroup.required ? 'Obrigatória' : 'Opcional'}
                  </p>
                </div>
                <span className="shrink-0 font-semibold folrounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
                  {selectedCount}/{currentGroup.maxSelections}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
          onScroll={(event) => setIsGroupDetailsCollapsed(event.currentTarget.scrollTop > 16)}
        >
          <div className="mx-auto w-full max-w-2xl px-5 py-5 sm:px-6">
            <div className="grid gap-3 pb-4">
              {currentGroup.options.map((option) => {
                const quantity = selectedOptions[currentGroup.id]?.[option.id] ?? 0
                const optionLimit = option.maxQuantity ?? currentGroup.maxSelections
                const canAdd = selectedCount < currentGroup.maxSelections && quantity < optionLimit
                return (
                  <article
                    className={`flex items-center gap-3 rounded-xl border p-3 transition-opacity ${quantity > 0 ? 'border-primary bg-primary/5' : 'border-border'} ${!canAdd && quantity === 0 ? 'opacity-50' : ''}`}
                    key={option.id}
                  >
                    {option.image ? (
                      <img
                        className="size-14 shrink-0 rounded-lg object-cover"
                        src={option.image}
                        alt=""
                      />
                    ) : (
                      <div >
                       
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm">{option.name}</p>
                      {option.description && (
                        <p className="mt-1 text-xs text-muted-foreground">{option.description}</p>
                      )}
                      <p className="mt-1 text-xs text-primary">
                        {option.price > 0 ? `+ ${formatPrice(option.price)}` : 'Incluso'}
                      </p>
                    </div>
                    <QuantityControl
                      quantity={quantity}
                      canAdd={canAdd}
                      onChange={(delta) => changeOption(option, delta)}
                    />
                  </article>
                )
              })}
            </div>
          </div>
        </div>
      </div>
      <CheckoutBar
        total={total}
        quantity={productQuantity}
        onQuantityChange={setProductQuantity}
        actionLabel={currentStep === groups.length - 1 ? 'Adicionar ao carrinho' : 'Próxima etapa'}
        disabled={!canContinue}
        onBack={
          currentStep > 0
            ? () => {
                setIsGroupDetailsCollapsed(false)
                setCurrentStep((step) => step - 1)
              }
            : undefined
        }
        onAction={continueSelection}
      />
    </ProductSetupScreen>
  )
}

function ProductSetupScreen({
  product,
  onClose,
  children,
}: {
  product: PublicMenuProduct
  onClose: () => void
  children: ReactNode
}) {
  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow
    const previousDocumentOverscroll = document.documentElement.style.overscrollBehavior
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overscrollBehavior = 'none'

    return () => {
      document.body.style.overflow = previousBodyOverflow
      document.documentElement.style.overscrollBehavior = previousDocumentOverscroll
    }
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex min-h-0 flex-col overflow-hidden overscroll-none bg-background"
      role="presentation"
    >
      <header className="shrink-0 border-b border-border bg-card">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-4 px-5 py-3 sm:px-6 sm:py-4">
          <div className="flex min-w-0 items-center gap-4">
            {product.image ? (
              <img
                className="size-16 shrink-0 rounded-xl object-cover sm:size-24"
                src={product.image}
                alt=""
              />
            ) : (
              <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-primary sm:size-24">
                <Store className="size-5 sm:size-7" />
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-base font-semibold sm:text-lg">{product.name}</p>
              <p className="text-sm text-muted-foreground">Personalize seu pedido</p>
            </div>
          </div>
          <Button
            size="icon-lg"
            variant="ghost"
            onClick={onClose}
            aria-label="Fechar"
          >
            <X />
          </Button>
        </div>
      </header>
      {children}
    </div>
  )
}

function CheckoutBar({
  total,
  quantity,
  onQuantityChange,
  actionLabel,
  disabled,
  onBack,
  onAction,
}: {
  total: number
  quantity: number
  onQuantityChange: (quantity: number) => void
  actionLabel: string
  disabled?: boolean
  onBack?: () => void
  onAction: () => void
}) {
  return (
    <div className="shrink-0 border-t border-border bg-card px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4">
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-2 sm:gap-4">
        {onBack ? (
          <Button
            className="px-2 sm:px-3"
            variant="ghost"
            onClick={onBack}
          >
            <ChevronLeft />
            <span className="hidden sm:inline">Voltar</span>
          </Button>
        ) : (
          <div />
        )}
        <QuantityControl
          quantity={quantity}
          canAdd
          onChange={(delta) => onQuantityChange(Math.max(1, quantity + delta))}
        />
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Total do item</p>
          <p className="font-semibold text-primary">{formatPrice(total)}</p>
        </div>
        <Button
          className="shrink-0 px-3 sm:px-4"
          disabled={disabled}
          onClick={onAction}
        >
          <span className="hidden sm:inline">{actionLabel}</span>
          <span className="sr-only sm:hidden">{actionLabel}</span>
          {actionLabel === 'Próxima etapa' ? <ChevronRight /> : <Plus/>}
        </Button>
      </div>
    </div>
  )
}

function createSelectedOptions(selections: CartSelection[]) {
  return selections.reduce<Record<string, Record<string, number>>>((groups, selection) => {
    groups[selection.groupId] = {
      ...groups[selection.groupId],
      [selection.option.id]: selection.quantity,
    }
    return groups
  }, {})
}

function getGroupProgress(selectedCount: number, maxSelections: number) {
  if (maxSelections === 0) return 0
  return Math.min(selectedCount / maxSelections, 1)
}

function QuantityControl({
  quantity,
  canAdd,
  onChange,
}: {
  quantity: number
  canAdd: boolean
  onChange: (delta: number) => void
}) {
  return (
    <div className="flex items-center gap-1">
      <Button
        size="icon-xs"
        variant="outline"
        disabled={quantity === 0}
        onClick={() => onChange(-1)}
        aria-label="Diminuir quantidade"
      >
        <Minus />
      </Button>
      <span className="w-6 text-center text-base font-medium">{quantity}</span>
      <Button
        size="icon-xs"
        variant="outline"
        disabled={!canAdd}
        onClick={() => onChange(1)}
        aria-label="Aumentar quantidade"
      >
        <Plus />
      </Button>
    </div>
  )
}

function formatPrice(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
