'use client'

import { GripVertical, LoaderCircle, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { closestCenter, DndContext, DragOverlay, MeasuringStrategy, PointerSensor, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthSessionStore } from '@/modules/auth/store/auth-session.store'
import { createProduct, deleteProduct, getProducts, reorderProducts } from '@/modules/menu/products/api/products.api'
import { ProductAccordion } from '@/modules/menu/products/components/product-accordion'
import type { Product } from '@/modules/menu/products/schemas/product.schema'

import { deleteCategory, updateCategory } from '../api/categories.api'
import type { Category } from '../schemas/category.schema'

export function CategoryEditor({ category }: { category: Category }) {
  const accessToken = useAuthSessionStore((state) => state.session?.accessToken)
  const queryClient = useQueryClient()
  const [title, setTitle] = useState(category.title)
  const [productName, setProductName] = useState('')
  const [productPrice, setProductPrice] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [activeProductId, setActiveProductId] = useState<string | null>(null)
  const productsQuery = useQuery({ queryKey: ['menu-products', category.id], queryFn: () => getProducts(category.id, accessToken!), enabled: Boolean(accessToken) })
  const refreshCategories = () => queryClient.invalidateQueries({ queryKey: ['menu-categories'] })
  const refreshProducts = () => queryClient.invalidateQueries({ queryKey: ['menu-products', category.id] })
  const categoryInput = (changes: Partial<Pick<Category, 'title' | 'active'>>) => ({ title, active: category.active, displayOrder: category.displayOrder, showInMenu: category.showInMenu, showInPos: category.showInPos, showInWaiter: category.showInWaiter, ...changes })
  const updateMutation = useMutation({ mutationFn: (input: ReturnType<typeof categoryInput>) => updateCategory(category.id, input, accessToken!), onSuccess: refreshCategories })
  const deleteCategoryMutation = useMutation({ mutationFn: () => deleteCategory(category.id, accessToken!), onSuccess: refreshCategories })
  const createProductMutation = useMutation({ mutationFn: () => createProduct({ name: productName.trim(), price: Number(productPrice), categoryId: category.id, active: true }, accessToken!), onSuccess: () => { setProductName(''); setProductPrice(''); refreshProducts() } })
  const deleteProductMutation = useMutation({ mutationFn: (id: string) => deleteProduct(id, accessToken!), onSuccess: refreshProducts })
  const reorderProductsMutation = useMutation({
    mutationFn: (products: Product[]) => reorderProducts(products, accessToken!),
    onMutate: async (products) => {
      await queryClient.cancelQueries({ queryKey: ['menu-products', category.id] })
      const previousProducts = queryClient.getQueryData<typeof productsQuery.data>(['menu-products', category.id])
      queryClient.setQueryData<typeof productsQuery.data>(['menu-products', category.id], (previous) => previous ? { ...previous, data: products.map((product, displayOrder) => ({ ...product, displayOrder })) } : previous)
      return { previousProducts }
    },
    onError: (_error, _products, context) => queryClient.setQueryData(['menu-products', category.id], context?.previousProducts),
  })
  const productSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))
  const canCreateProduct = productName.trim().length >= 3 && Number.isFinite(Number(productPrice)) && Number(productPrice) >= 0
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category.id,
    animateLayoutChanges: () => false,
    transition: null,
  })
  const products = [...(productsQuery.data?.data ?? [])].sort((first, second) => (first.displayOrder ?? 0) - (second.displayOrder ?? 0))
  const activeProduct = products.find((product) => product.id === activeProductId)
  const canExpand = productsQuery.data === undefined || products.length > 0

  function handleProductDragEnd({ active, over }: DragEndEvent) {
    setActiveProductId(null)
    if (!over || active.id === over.id) return
    const oldIndex = products.findIndex((product) => product.id === active.id)
    const newIndex = products.findIndex((product) => product.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    reorderProductsMutation.mutate(arrayMove(products, oldIndex, newIndex))
  }

  async function toggleCategory() {
    if (isExpanded) return setIsExpanded(false)
    const response = await productsQuery.refetch()
    if (response.data?.data.length) setIsExpanded(true)
  }

  function saveTitle() {
    const nextTitle = title.trim()
    if (nextTitle.length < 2 || nextTitle === category.title) return setIsEditingTitle(false)
    updateMutation.mutate(categoryInput({ title: nextTitle }), { onSuccess: () => setIsEditingTitle(false) })
  }

  return <section ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, willChange: transform ? 'transform' : undefined }} className={`group/category rounded-xl border border-border bg-card ${isDragging ? 'opacity-50 shadow-lg' : ''}`}>
    <div className="flex items-center gap-1 px-3 py-2">
      <button className="flex size-9 cursor-grab touch-none items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity group-hover/category:opacity-100 focus-visible:opacity-100 hover:bg-muted active:cursor-grabbing" type="button" aria-label={`Reordenar ${category.title}`} {...attributes} {...listeners}><GripVertical className="size-5" /></button>
      {isEditingTitle ? <Input className="h-9 min-w-0 flex-1" value={title} onChange={(event) => setTitle(event.target.value)} onBlur={saveTitle} onKeyDown={(event) => { if (event.key === 'Enter') saveTitle(); if (event.key === 'Escape') { setTitle(category.title); setIsEditingTitle(false) } }} aria-label="Nome da categoria" autoFocus /> : <button className="min-w-0 flex-1 rounded-lg px-2 py-2 text-left hover:bg-muted/60" type="button" onClick={toggleCategory} disabled={!canExpand || productsQuery.isFetching} aria-expanded={isExpanded}><div className="min-w-0"><p className="truncate font-medium">{category.title}</p><p className="mt-1 text-xs text-muted-foreground">{category.active ? 'Categoria ativa' : 'Categoria desativada'}</p></div></button>}
      <div className={`flex items-center gap-1 transition-opacity ${isEditingTitle ? 'opacity-100' : 'opacity-0 group-hover/category:opacity-100 focus-within:opacity-100'}`}><Button className="size-8" size="icon" variant="ghost" type="button" onClick={() => setIsEditingTitle(true)} aria-label={`Editar ${category.title}`}><Pencil /></Button><Button className="size-8" size="icon" variant="ghost" type="button" onClick={() => deleteCategoryMutation.mutate()} disabled={deleteCategoryMutation.isPending} aria-label={`Remover ${category.title}`}><Trash2 className="text-destructive" /></Button></div>
      {canExpand && <button className={`flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-lg leading-none text-muted-foreground transition-transform ${isExpanded ? 'rotate-45' : ''}`} type="button" onClick={toggleCategory} disabled={productsQuery.isFetching} aria-label={isExpanded ? `Fechar ${category.title}` : `Abrir ${category.title}`}>+</button>}
    </div>
    {isExpanded && <div className="border-t border-border p-5">
    <div><div className="flex items-center justify-between"><h2 className="text-sm font-semibold">Produtos</h2><span className="text-xs text-muted-foreground">{products.length} cadastrados</span></div>
      {productsQuery.isPending ? <p className="mt-3 text-sm text-muted-foreground">Carregando produtos…</p> : productsQuery.isError ? <p className="mt-3 text-sm text-destructive">Não foi possível carregar os produtos.</p> : <DndContext sensors={productSensors} collisionDetection={closestCenter} measuring={{ droppable: { strategy: MeasuringStrategy.Always } }} onDragStart={({ active }: DragStartEvent) => setActiveProductId(String(active.id))} onDragCancel={() => setActiveProductId(null)} onDragEnd={handleProductDragEnd}><SortableContext items={products.map((product) => product.id)} strategy={verticalListSortingStrategy}><div className="mt-3 grid gap-2">{products.map((product) => <ProductAccordion key={product.id} product={product} isRemoving={deleteProductMutation.isPending} onRemove={deleteProductMutation.mutate} />)}</div></SortableContext><DragOverlay adjustScale={false} dropAnimation={null}>{activeProduct ? <div className="rounded-lg border border-primary/30 bg-card px-4 py-3 shadow-xl"><p className="text-sm font-medium">{activeProduct.name}</p></div> : null}</DragOverlay></DndContext>}
      <form className="mt-4 grid gap-2 sm:grid-cols-[1fr_9rem_auto]" onSubmit={(event) => { event.preventDefault(); if (canCreateProduct) createProductMutation.mutate() }}><Input placeholder="Nome do produto" value={productName} onChange={(event) => setProductName(event.target.value)} /><Input type="number" min="0" step="0.01" placeholder="Preço" value={productPrice} onChange={(event) => setProductPrice(event.target.value)} /><Button type="submit" disabled={!canCreateProduct || createProductMutation.isPending}>{createProductMutation.isPending ? <LoaderCircle className="animate-spin" /> : <Plus />}Adicionar</Button></form>
    </div>
    </div>}
  </section>
}
