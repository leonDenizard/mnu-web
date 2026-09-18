'use client'

import { LoaderCircle, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthSessionStore } from '@/features/auth/store/auth-session.store'
import { createProduct, deleteProduct, getProducts } from '@/features/menu/products/api/products.api'

import { deleteCategory, updateCategory } from '../api/categories.api'
import type { Category } from '../schemas/category.schema'

export function CategoryEditor({ category }: { category: Category }) {
  const accessToken = useAuthSessionStore((state) => state.session?.accessToken)
  const queryClient = useQueryClient()
  const [title, setTitle] = useState(category.title)
  const [productName, setProductName] = useState('')
  const [productPrice, setProductPrice] = useState('')
  const productsQuery = useQuery({ queryKey: ['menu-products', category.id], queryFn: () => getProducts(category.id, accessToken!), enabled: Boolean(accessToken) })
  const refreshCategories = () => queryClient.invalidateQueries({ queryKey: ['menu-categories'] })
  const refreshProducts = () => queryClient.invalidateQueries({ queryKey: ['menu-products', category.id] })
  const categoryInput = (changes: Partial<Pick<Category, 'title' | 'active'>>) => ({ title, active: category.active, displayOrder: category.displayOrder, showInMenu: category.showInMenu, showInPos: category.showInPos, showInWaiter: category.showInWaiter, ...changes })
  const updateMutation = useMutation({ mutationFn: (input: ReturnType<typeof categoryInput>) => updateCategory(category.id, input, accessToken!), onSuccess: refreshCategories })
  const deleteCategoryMutation = useMutation({ mutationFn: () => deleteCategory(category.id, accessToken!), onSuccess: refreshCategories })
  const createProductMutation = useMutation({ mutationFn: () => createProduct({ name: productName.trim(), price: Number(productPrice), categoryId: category.id, active: true }, accessToken!), onSuccess: () => { setProductName(''); setProductPrice(''); refreshProducts() } })
  const deleteProductMutation = useMutation({ mutationFn: (id: string) => deleteProduct(id, accessToken!), onSuccess: refreshProducts })
  const canCreateProduct = productName.trim().length >= 3 && Number.isFinite(Number(productPrice)) && Number(productPrice) >= 0

  return <section className="rounded-xl border border-border bg-card p-5">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 flex-1 items-center gap-3"><Input className="max-w-sm font-medium" value={title} onChange={(event) => setTitle(event.target.value)} aria-label="Nome da categoria" /><label className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground"><input type="checkbox" checked={category.active} onChange={(event) => updateMutation.mutate(categoryInput({ active: event.target.checked }))} disabled={updateMutation.isPending} />Ativa</label></div>
      <div className="flex gap-2"><Button variant="outline" onClick={() => updateMutation.mutate(categoryInput({ title: title.trim() }))} disabled={title.trim().length < 2 || updateMutation.isPending}>{updateMutation.isPending ? <LoaderCircle className="animate-spin" /> : <Pencil />}Salvar</Button><Button variant="destructive" onClick={() => deleteCategoryMutation.mutate()} disabled={deleteCategoryMutation.isPending} aria-label={`Remover ${category.title}`}><Trash2 /> Remover</Button></div>
    </div>
    <div className="mt-5 border-t border-border pt-5"><div className="flex items-center justify-between"><h2 className="text-sm font-semibold">Produtos</h2><span className="text-xs text-muted-foreground">{productsQuery.data?.data.length ?? 0} cadastrados</span></div>
      {productsQuery.isPending ? <p className="mt-3 text-sm text-muted-foreground">Carregando produtos…</p> : productsQuery.isError ? <p className="mt-3 text-sm text-destructive">Não foi possível carregar os produtos.</p> : <div className="mt-3 grid gap-2">{productsQuery.data?.data.map((product) => <div className="flex items-center justify-between gap-3 rounded-lg bg-muted/60 px-3 py-2" key={product.id}><div className="min-w-0"><p className="truncate text-sm font-medium">{product.name}</p><p className="text-xs text-muted-foreground">{formatCurrency(product.price ?? 0)}</p></div><Button size="icon-sm" variant="ghost" onClick={() => deleteProductMutation.mutate(product.id)} disabled={deleteProductMutation.isPending} aria-label={`Remover ${product.name}`}><Trash2 className="text-destructive" /></Button></div>)}</div>}
      <form className="mt-4 grid gap-2 sm:grid-cols-[1fr_9rem_auto]" onSubmit={(event) => { event.preventDefault(); if (canCreateProduct) createProductMutation.mutate() }}><Input placeholder="Nome do produto" value={productName} onChange={(event) => setProductName(event.target.value)} /><Input type="number" min="0" step="0.01" placeholder="Preço" value={productPrice} onChange={(event) => setProductPrice(event.target.value)} /><Button type="submit" disabled={!canCreateProduct || createProductMutation.isPending}>{createProductMutation.isPending ? <LoaderCircle className="animate-spin" /> : <Plus />}Adicionar</Button></form>
    </div>
  </section>
}

function formatCurrency(value: number) { return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }
