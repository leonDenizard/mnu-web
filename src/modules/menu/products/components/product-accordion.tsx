'use client'

/* eslint-disable @next/next/no-img-element -- image URLs are supplied dynamically by each store. */

import { closestCenter, DndContext, DragOverlay, MeasuringStrategy, PointerSensor, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Camera, ChevronDown, FolderPlus, GripVertical, LoaderCircle, Pencil, Store, Trash2, X } from 'lucide-react'
import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthSessionStore } from '@/modules/auth/store/auth-session.store'
import { getModifierGroups, getProductModifierGroups, linkModifierGroupToProduct, reorderModifierOptions, reorderProductModifierGroups, unlinkModifierGroupFromProduct, updateProductModifierGroup } from '@/modules/menu/modifier-groups/api/product-modifier-groups.api'
import type { ModifierOption, ProductModifierGroup } from '@/modules/menu/modifier-groups/schemas/product-modifier-group.schema'

import { updateProduct } from '../api/products.api'
import type { Product, ProductUpdateInput } from '../schemas/product.schema'

type ProductAccordionProps = { product: Product; isRemoving: boolean; onRemove: (id: string) => void }
type Feedback = { kind: 'success' | 'error'; message: string }

export function ProductAccordion({ product, isRemoving, onRemove }: ProductAccordionProps) {
  const accessToken = useAuthSessionStore((state) => state.session?.accessToken)
  const queryClient = useQueryClient()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [name, setName] = useState(product.name)
  const [price, setPrice] = useState(String(product.price ?? 0))
  const [image, setImage] = useState(product.image ?? '')
  const [selectionLimits, setSelectionLimits] = useState<Record<string, { minSelections: number; maxSelections: number }>>({})
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null)
  const modifierGroupsQuery = useQuery({ queryKey: ['product-modifier-groups', product.id], queryFn: () => getProductModifierGroups(product.id, accessToken!), enabled: Boolean(accessToken) })
  const availableGroupsQuery = useQuery({ queryKey: ['modifier-groups'], queryFn: () => getModifierGroups(accessToken!), enabled: Boolean(accessToken) && isEditDialogOpen })
  const groups = [...(modifierGroupsQuery.data?.data ?? [])].sort((first, second) => first.displayOrder - second.displayOrder)
  const activeGroup = groups.find((group) => group.id === activeGroupId)
  const canExpand = modifierGroupsQuery.data === undefined || groups.length > 0
  const reorderMutation = useMutation({
    mutationFn: (nextGroups: ProductModifierGroup[]) => reorderProductModifierGroups(nextGroups, accessToken!),
    onMutate: async (nextGroups) => {
      await queryClient.cancelQueries({ queryKey: ['product-modifier-groups', product.id] })
      const previousGroups = queryClient.getQueryData<typeof modifierGroupsQuery.data>(['product-modifier-groups', product.id])
      queryClient.setQueryData<typeof modifierGroupsQuery.data>(['product-modifier-groups', product.id], (previous) => previous ? { ...previous, data: nextGroups.map((group, displayOrder) => ({ ...group, displayOrder })) } : previous)
      return { previousGroups }
    },
    onError: (_error, _groups, context) => queryClient.setQueryData(['product-modifier-groups', product.id], context?.previousGroups),
  })
  const updateProductMutation = useMutation({
    mutationFn: async () => {
      const input: ProductUpdateInput = { name: name.trim(), price: Number(price), categoryId: product.categoryId, active: product.active, displayOrder: product.displayOrder ?? 0, ...(image.trim() ? { image: image.trim() } : {}) }
      await updateProduct(product.id, input, accessToken!)
      await Promise.all(groups.map((group) => {
        const limits = selectionLimits[group.id] ?? group
        return updateProductModifierGroup(group.id, { minSelections: limits.minSelections, maxSelections: limits.maxSelections }, accessToken!)
      }))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-products', product.categoryId] })
      queryClient.invalidateQueries({ queryKey: ['product-modifier-groups', product.id] })
      setIsEditDialogOpen(false)
      setFeedback({ kind: 'success', message: 'Produto atualizado com sucesso.' })
    },
    onError: () => setFeedback({ kind: 'error', message: 'Não foi possível salvar as alterações do produto.' }),
  })
  const linkMutation = useMutation({ mutationFn: (modifierGroupId: string) => linkModifierGroupToProduct(product.id, modifierGroupId, accessToken!), onSuccess: (response) => { queryClient.setQueryData(['product-modifier-groups', product.id], response); setFeedback({ kind: 'success', message: 'Adicional vinculado ao produto.' }) }, onError: () => setFeedback({ kind: 'error', message: 'Não foi possível vincular o adicional.' }) })
  const unlinkMutation = useMutation({ mutationFn: (modifierGroupId: string) => unlinkModifierGroupFromProduct(product.id, modifierGroupId, accessToken!), onSuccess: (response) => { queryClient.setQueryData(['product-modifier-groups', product.id], response); setFeedback({ kind: 'success', message: 'Adicional removido do produto.' }) }, onError: () => setFeedback({ kind: 'error', message: 'Não foi possível remover o adicional.' }) })
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  useEffect(() => {
    if (!isEditDialogOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previousOverflow }
  }, [isEditDialogOpen])

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveGroupId(null)
    if (!over || active.id === over.id) return
    const oldIndex = groups.findIndex((group) => group.id === active.id)
    const newIndex = groups.findIndex((group) => group.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    reorderMutation.mutate(arrayMove(groups, oldIndex, newIndex))
  }

  async function toggleProduct() {
    if (isExpanded) return setIsExpanded(false)
    const response = await modifierGroupsQuery.refetch()
    if (response.data?.data.length) setIsExpanded(true)
  }

  function openEditDialog() {
    setName(product.name)
    setPrice(String(product.price ?? 0))
    setImage(product.image ?? '')
    setSelectionLimits(Object.fromEntries(groups.map((group) => [group.id, { minSelections: group.minSelections, maxSelections: group.maxSelections }])))
    setIsEditDialogOpen(true)
  }

  function changeImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return setFeedback({ kind: 'error', message: 'Selecione um arquivo de imagem válido.' })
    if (file.size > 2 * 1024 * 1024) return setFeedback({ kind: 'error', message: 'A imagem deve ter no máximo 2 MB.' })
    const reader = new FileReader()
    reader.onload = () => setImage(String(reader.result))
    reader.onerror = () => setFeedback({ kind: 'error', message: 'Não foi possível carregar esta imagem.' })
    reader.readAsDataURL(file)
  }

  return <><SortableProduct product={product} isRemoving={isRemoving} onRemove={onRemove} onEdit={openEditDialog} header={<button className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left" type="button" onClick={toggleProduct} disabled={!canExpand || modifierGroupsQuery.isFetching} aria-expanded={isExpanded}>
      <div className="flex min-w-0 items-center gap-3">{product.image ? <img className="size-10 shrink-0 rounded-md object-cover" src={product.image} alt="" /> : <ImagePlaceholder className="size-10" />}<div className="min-w-0"><p className="truncate text-sm font-medium">{product.name}</p><p className="text-xs text-muted-foreground">{formatCurrency(product.price ?? 0)}</p></div></div>{canExpand && <ChevronDown className={`size-4 shrink-0 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />}
    </button>}>{isExpanded && <div className="border-t border-border px-3 py-3"><div className="flex items-center justify-between"><h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Adicionais vinculados</h3><span className="text-xs text-muted-foreground">{groups.length}</span></div>
      {modifierGroupsQuery.isPending ? <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground"><LoaderCircle className="size-4 animate-spin" />Carregando adicionais…</p> : modifierGroupsQuery.isError ? <p className="mt-3 text-sm text-destructive">Não foi possível carregar os adicionais.</p> : groups.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">Nenhum adicional vinculado a este produto.</p> : <DndContext sensors={sensors} collisionDetection={closestCenter} measuring={{ droppable: { strategy: MeasuringStrategy.Always } }} onDragStart={({ active }: DragStartEvent) => setActiveGroupId(String(active.id))} onDragCancel={() => setActiveGroupId(null)} onDragEnd={handleDragEnd}><SortableContext items={groups.map((group) => group.id)} strategy={verticalListSortingStrategy}><div className="mt-3 grid gap-2">{groups.map((group) => <ModifierGroupCard group={group} key={group.id} />)}</div></SortableContext><DragOverlay adjustScale={false} dropAnimation={null}>{activeGroup ? <div className="rounded-md border border-primary/30 bg-background px-4 py-3 shadow-xl"><p className="text-sm font-medium">{activeGroup.name}</p></div> : null}</DragOverlay></DndContext>}
    </div>}</SortableProduct>{isEditDialogOpen && <ProductEditDialog name={name} price={price} image={image} groups={groups} availableGroups={availableGroupsQuery.data?.data ?? []} selectionLimits={selectionLimits} isSaving={updateProductMutation.isPending} isLoadingGroups={availableGroupsQuery.isPending} isUpdatingGroups={linkMutation.isPending || unlinkMutation.isPending} onClose={() => setIsEditDialogOpen(false)} onNameChange={setName} onPriceChange={setPrice} onImageFileChange={changeImage} onLimitChange={(groupId, field, value) => setSelectionLimits((current) => ({ ...current, [groupId]: { ...(current[groupId] ?? groups.find((group) => group.id === groupId)!), [field]: Math.max(0, Number(value)) } }))} onToggleGroup={(groupId, linked) => linked ? unlinkMutation.mutate(groupId) : linkMutation.mutate(groupId)} onSave={() => updateProductMutation.mutate()} />}{feedback && <FeedbackToast feedback={feedback} onClose={() => setFeedback(null)} />}</>
}

function SortableProduct({ product, isRemoving, onRemove, onEdit, header, children }: ProductAccordionProps & { onEdit: () => void; header: ReactNode; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: product.id, animateLayoutChanges: () => false, transition: null })
  return <article ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={`group/product rounded-lg bg-muted/60 ${isDragging ? 'opacity-50' : ''}`}><div className="flex items-center gap-2 px-3 py-2"><button className="cursor-grab touch-none text-muted-foreground opacity-0 transition-opacity group-hover/product:opacity-100 focus-visible:opacity-100 active:cursor-grabbing" type="button" aria-label={`Reordenar ${product.name}`} {...attributes} {...listeners}><GripVertical className="size-4" /></button>{header}<div className="flex gap-1 opacity-0 transition-opacity group-hover/product:opacity-100 focus-within:opacity-100"><Button size="icon-sm" variant="ghost" onClick={onEdit} aria-label={`Editar ${product.name}`}><Pencil /></Button><Button size="icon-sm" variant="ghost" onClick={() => onRemove(product.id)} disabled={isRemoving} aria-label={`Remover ${product.name}`}><Trash2 className="text-destructive" /></Button></div></div>{children}</article>
}

type ProductEditDialogProps = {
  name: string
  price: string
  image: string
  groups: ProductModifierGroup[]
  availableGroups: ProductModifierGroup[]
  selectionLimits: Record<string, { minSelections: number; maxSelections: number }>
  isSaving: boolean
  isLoadingGroups: boolean
  isUpdatingGroups: boolean
  onClose: () => void
  onNameChange: (value: string) => void
  onPriceChange: (value: string) => void
  onImageFileChange: (event: ChangeEvent<HTMLInputElement>) => void
  onLimitChange: (groupId: string, field: 'minSelections' | 'maxSelections', value: string) => void
  onToggleGroup: (groupId: string, linked: boolean) => void
  onSave: () => void
}

function ProductEditDialog({ name, price, image, groups, availableGroups, selectionLimits, isSaving, isLoadingGroups, isUpdatingGroups, onClose, onNameChange, onPriceChange, onImageFileChange, onLimitChange, onToggleGroup, onSave }: ProductEditDialogProps) {
  const canSave = name.trim().length >= 3 && Number.isFinite(Number(price)) && Number(price) >= 0
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isAddingGroupsOpen, setIsAddingGroupsOpen] = useState(true)
  const linkedGroups = availableGroups.filter((group) => groups.some((item) => item.id === group.id))
  const unlinkedGroups = availableGroups.filter((group) => !groups.some((item) => item.id === group.id))

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-6 backdrop-blur-sm" role="presentation"><section className="max-h-[92vh] w-full max-w-5xl overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden rounded-2xl border border-border bg-card p-8 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="product-edit-title"><div className="flex items-start justify-between gap-4"><div className="flex items-center gap-5"><div className="group/image relative">{image ? <img className="size-24 rounded-xl object-cover" src={image} alt="" /> : <ImagePlaceholder className="size-24" />}<input className="sr-only" ref={fileInputRef} type="file" accept="image/*" onChange={onImageFileChange} /><Button className="absolute inset-x-2 bottom-2 opacity-0 transition-opacity group-hover/image:opacity-100" size="xs" type="button" onClick={() => fileInputRef.current?.click()}><Camera />Editar foto</Button></div><div><h2 className="text-xl font-semibold" id="product-edit-title">Editar produto</h2><p className="mt-1 text-sm text-muted-foreground">Atualize as informações e os adicionais do item.</p></div></div><Button className="size-11 text-lg" size="icon-lg" variant="ghost" type="button" onClick={onClose} aria-label="Fechar" title="Fechar modal"><X className="size-6" /></Button></div><div className="mt-7 grid gap-4 sm:grid-cols-2"><label className="grid gap-1.5 text-sm font-medium sm:col-span-2">Nome<Input value={name} onChange={(event) => onNameChange(event.target.value)} /></label><label className="grid gap-1.5 text-sm font-medium">Preço<Input type="number" min="0" step="0.01" value={price} onChange={(event) => onPriceChange(event.target.value)} /></label></div><div className="mt-7 border-t border-border pt-5"><h3 className="font-medium">Adicionais vinculados</h3><p className="mt-1 text-sm text-muted-foreground">Defina a quantidade mínima e máxima dos grupos já conectados ao produto.</p>{isLoadingGroups ? <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"><LoaderCircle className="size-4 animate-spin" />Carregando adicionais…</p> : <><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{linkedGroups.map((group) => { const linkedGroup = groups.find((item) => item.id === group.id); const limits = selectionLimits[group.id] ?? linkedGroup; return <div className="rounded-lg border border-border p-3" key={group.id}><div className="flex items-center justify-between gap-3 text-sm font-medium"><span>{group.name}</span><Button size="xs" variant="ghost" type="button" onClick={() => onToggleGroup(group.id, true)} disabled={isUpdatingGroups} title="Desvincular adicional">Remover</Button></div>{limits && <div className="mt-3 grid grid-cols-2 gap-3"><label className="grid gap-1 text-xs text-muted-foreground">Mínimo<Input type="number" min="0" max={limits.maxSelections} value={limits.minSelections} onChange={(event) => onLimitChange(group.id, 'minSelections', event.target.value)} /></label><label className="grid gap-1 text-xs text-muted-foreground">Máximo<Input type="number" min={limits.minSelections} value={limits.maxSelections} onChange={(event) => onLimitChange(group.id, 'maxSelections', event.target.value)} /></label></div>}</div> })}</div>{linkedGroups.length === 0 && <p className="mt-4 text-sm text-muted-foreground">Nenhum adicional vinculado.</p>}<div className="mt-5 rounded-lg border border-dashed border-border p-3"><div className="flex items-center justify-between gap-3"><p className="flex items-center gap-2 text-sm font-medium text-primary"><FolderPlus className="size-4" />Adicionar adicionais ({unlinkedGroups.length})</p><Button size="xs" variant="ghost" type="button" onClick={() => setIsAddingGroupsOpen((open) => !open)}>{isAddingGroupsOpen ? 'Fechar' : 'Abrir'}</Button></div>{isAddingGroupsOpen && <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{unlinkedGroups.map((group) => <label className="flex cursor-pointer items-center justify-between gap-3 rounded-md px-2 py-2 text-sm hover:bg-muted" key={group.id}><span>{group.name}</span><input className="size-5 cursor-pointer accent-primary" type="checkbox" checked={false} disabled={isUpdatingGroups} onChange={() => onToggleGroup(group.id, false)} /></label>)}</div>}</div></>}</div><div className="mt-7 flex justify-end gap-2"><Button variant="outline" type="button" onClick={onClose}>Cancelar</Button><Button type="button" disabled={!canSave || isSaving} onClick={onSave}>{isSaving && <LoaderCircle className="animate-spin" />}Salvar alterações</Button></div></section></div>
}

function FeedbackToast({ feedback, onClose }: { feedback: Feedback; onClose: () => void }) {
  return <div className={`fixed bottom-5 right-5 z-[60] flex max-w-sm items-center gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg ${feedback.kind === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-destructive/30 bg-destructive/10 text-destructive'}`} role="status"><span>{feedback.message}</span><Button className="size-6" size="icon-xs" variant="ghost" onClick={onClose} aria-label="Fechar aviso" title="Fechar aviso">×</Button></div>
}

function ModifierGroupCard({ group }: { group: ProductModifierGroup }) {
  const accessToken = useAuthSessionStore((state) => state.session?.accessToken)
  const queryClient = useQueryClient()
  const [activeOptionId, setActiveOptionId] = useState<string | null>(null)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: group.id, animateLayoutChanges: () => false, transition: null })
  const options = [...group.options].sort((first, second) => first.displayOrder - second.displayOrder)
  const activeOption = options.find((option) => option.id === activeOptionId)
  const optionsQueryKey = ['product-modifier-groups']
  const reorderOptionsMutation = useMutation({
    mutationFn: (nextOptions: ModifierOption[]) => reorderModifierOptions(group.id, nextOptions, accessToken!),
    onMutate: async (nextOptions) => {
      await queryClient.cancelQueries({ queryKey: optionsQueryKey })
      const cacheEntries = queryClient.getQueriesData<{ success: true; data: ProductModifierGroup[] }>({ queryKey: optionsQueryKey })
      cacheEntries.forEach(([key, response]) => queryClient.setQueryData(key, response ? { ...response, data: response.data.map((item) => item.id === group.id ? { ...item, options: nextOptions.map((option, displayOrder) => ({ ...option, displayOrder })) } : item) } : response))
      return { cacheEntries }
    },
    onError: (_error, _options, context) => context?.cacheEntries.forEach(([key, response]) => queryClient.setQueryData(key, response)),
  })
  const optionSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  function handleOptionDragEnd({ active, over }: DragEndEvent) {
    setActiveOptionId(null)
    if (!over || active.id === over.id) return
    const oldIndex = options.findIndex((option) => option.id === active.id)
    const newIndex = options.findIndex((option) => option.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    reorderOptionsMutation.mutate(arrayMove(options, oldIndex, newIndex))
  }

  return <section ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={`group/modifier rounded-md border border-border bg-background p-3 ${isDragging ? 'opacity-50' : ''}`}><div className="flex items-start gap-2"><button className="mt-0.5 cursor-grab touch-none text-muted-foreground opacity-0 transition-opacity group-hover/modifier:opacity-100 focus-visible:opacity-100 active:cursor-grabbing" type="button" aria-label={`Reordenar adicional ${group.name}`} {...attributes} {...listeners}><GripVertical className="size-4" /></button><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-sm font-medium">{group.name}</p>{group.surname && <p className="text-xs text-muted-foreground">{group.surname}</p>}</div><span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">{selectionLabel(group.minSelections, group.maxSelections, group.required)}</span></div>{options.length > 0 && <DndContext sensors={optionSensors} collisionDetection={closestCenter} measuring={{ droppable: { strategy: MeasuringStrategy.Always } }} onDragStart={({ active }: DragStartEvent) => setActiveOptionId(String(active.id))} onDragCancel={() => setActiveOptionId(null)} onDragEnd={handleOptionDragEnd}><SortableContext items={options.map((option) => option.id)} strategy={verticalListSortingStrategy}><ul className="mt-3 divide-y divide-border border-t border-border">{options.map((option) => <ModifierOptionRow option={option} key={option.id} />)}</ul></SortableContext><DragOverlay adjustScale={false} dropAnimation={null}>{activeOption ? <div className="rounded-md border border-primary/30 bg-background px-4 py-2 shadow-xl"><p className="text-sm">{activeOption.name}</p></div> : null}</DragOverlay></DndContext>}</div></div></section>
}

function ModifierOptionRow({ option }: { option: ModifierOption }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: option.id, animateLayoutChanges: () => false, transition: null })
  return <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={`group/option flex items-start gap-2 py-2 text-sm ${isDragging ? 'opacity-50' : ''}`}><button className="mt-0.5 cursor-grab touch-none text-muted-foreground opacity-0 transition-opacity group-hover/option:opacity-100 focus-visible:opacity-100 active:cursor-grabbing" type="button" aria-label={`Reordenar ${option.name}`} {...attributes} {...listeners}><GripVertical className="size-4" /></button><div className="flex min-w-0 flex-1 items-start gap-3">{option.image ? <img className="size-9 shrink-0 rounded-md object-cover" src={option.image} alt="" /> : <ImagePlaceholder className="size-9" />}<div className="min-w-0 flex-1"><p>{option.name}</p>{option.description && <p className="mt-0.5 text-xs text-muted-foreground">{option.description}</p>}<p className="mt-1 text-xs text-muted-foreground">{formatCurrency(option.price)}</p></div></div></li>
}

function ImagePlaceholder({ className }: { className: string }) {
  return <div className={`flex shrink-0 items-center justify-center rounded-md bg-violet-50 text-primary ${className}`}><Store className="size-4" aria-hidden="true" /></div>
}

function selectionLabel(minSelections: number, maxSelections: number, required: boolean) {
  if (minSelections === maxSelections) return `${minSelections} seleção${minSelections === 1 ? '' : 'ões'}`
  return `${required ? 'Obrigatório' : 'Opcional'} · até ${maxSelections}`
}

function formatCurrency(value: number) { return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }
