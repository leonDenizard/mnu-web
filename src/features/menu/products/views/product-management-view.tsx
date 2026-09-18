'use client'

import { FolderPlus, LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthSessionStore } from '@/features/auth/store/auth-session.store'
import { CategoryEditor } from '@/features/menu/categories/components/category-editor'
import { createCategory, getCategories } from '@/features/menu/categories/api/categories.api'

export function ProductManagementView() {
  const accessToken = useAuthSessionStore((state) => state.session?.accessToken)
  const queryClient = useQueryClient()
  const [newCategoryName, setNewCategoryName] = useState('')
  const categoriesQuery = useQuery({ queryKey: ['menu-categories'], queryFn: () => getCategories(accessToken!), enabled: Boolean(accessToken) })
  const createCategoryMutation = useMutation({ mutationFn: () => createCategory({ title: newCategoryName.trim(), active: true, displayOrder: categoriesQuery.data?.data.length ?? 0, showInMenu: true, showInPos: false, showInWaiter: false }, accessToken!), onSuccess: () => { setNewCategoryName(''); queryClient.invalidateQueries({ queryKey: ['menu-categories'] }) } })
  const canCreateCategory = newCategoryName.trim().length >= 2

  return <main className="mx-auto w-full max-w-5xl px-6 py-12 sm:py-16"><header className="max-w-2xl"><p className="text-sm font-semibold text-primary">Cardápio</p><h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">Gerenciador de produtos</h1><p className="mt-3 text-base leading-7 text-muted-foreground">Organize as categorias e os produtos que aparecem no seu cardápio.</p></header>
    <form className="mt-10 flex max-w-2xl gap-2" onSubmit={(event) => { event.preventDefault(); if (canCreateCategory) createCategoryMutation.mutate() }}><Input placeholder="Nova categoria, por exemplo: Lanches" value={newCategoryName} onChange={(event) => setNewCategoryName(event.target.value)} /><Button type="submit" disabled={!canCreateCategory || createCategoryMutation.isPending}>{createCategoryMutation.isPending ? <LoaderCircle className="animate-spin" /> : <FolderPlus />}Nova categoria</Button></form>
    <div className="mt-6 grid gap-4">{categoriesQuery.isPending ? <p className="text-sm text-muted-foreground">Carregando categorias…</p> : categoriesQuery.isError ? <p className="text-sm text-destructive">Não foi possível carregar as categorias.</p> : categoriesQuery.data?.data.length ? categoriesQuery.data.data.map((category) => <CategoryEditor category={category} key={category.id} />) : <p className="rounded-xl border border-dashed border-border px-5 py-10 text-center text-sm text-muted-foreground">Crie a primeira categoria para começar a montar seu cardápio.</p>}</div>
  </main>
}
