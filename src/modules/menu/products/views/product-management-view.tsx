'use client'

import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MeasuringStrategy,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { FolderPlus, LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthSessionStore } from '@/modules/auth/store/auth-session.store'
import { CategoryEditor } from '@/modules/menu/categories/components/category-editor'
import {
  createCategory,
  getCategories,
  reorderCategories,
} from '@/modules/menu/categories/api/categories.api'
import type { Category } from '@/modules/menu/categories/schemas/category.schema'

export function ProductManagementView() {
  const accessToken = useAuthSessionStore((state) => state.session?.accessToken)
  const queryClient = useQueryClient()
  const [newCategoryName, setNewCategoryName] = useState('')
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)
  const categoriesQuery = useQuery({
    queryKey: ['menu-categories'],
    queryFn: () => getCategories(accessToken!),
    enabled: Boolean(accessToken),
  })
  const createCategoryMutation = useMutation({
    mutationFn: () =>
      createCategory(
        {
          title: newCategoryName.trim(),
          active: true,
          displayOrder: categoriesQuery.data?.data.length ?? 0,
          showInMenu: true,
          showInPos: false,
          showInWaiter: false,
        },
        accessToken!,
      ),
    onSuccess: () => {
      setNewCategoryName('')
      queryClient.invalidateQueries({ queryKey: ['menu-categories'] })
    },
  })
  const reorderMutation = useMutation({
    mutationFn: (categories: Category[]) => reorderCategories(categories, accessToken!),
    onMutate: async (categories) => {
      await queryClient.cancelQueries({ queryKey: ['menu-categories'] })
      const previousCategories = queryClient.getQueryData<typeof categoriesQuery.data>([
        'menu-categories',
      ])
      queryClient.setQueryData<typeof categoriesQuery.data>(['menu-categories'], (previous) =>
        previous
          ? {
              ...previous,
              data: categories.map((category, displayOrder) => ({ ...category, displayOrder })),
            }
          : previous,
      )
      return { previousCategories }
    },
    onError: (_error, _categories, context) =>
      queryClient.setQueryData(['menu-categories'], context?.previousCategories),
  })
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const canCreateCategory = newCategoryName.trim().length >= 2
  const categories = [...(categoriesQuery.data?.data ?? [])].sort(
    (first, second) => first.displayOrder - second.displayOrder,
  )
  const activeCategory = categories.find((category) => category.id === activeCategoryId)

  function handleDragStart({ active }: DragStartEvent) {
    setActiveCategoryId(String(active.id))
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveCategoryId(null)
    if (!over || active.id === over.id) return
    const oldIndex = categories.findIndex((category) => category.id === active.id)
    const newIndex = categories.findIndex((category) => category.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    reorderMutation.mutate(arrayMove(categories, oldIndex, newIndex))
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12 sm:py-16">
      <header className="max-w-2xl">
        <p className="text-sm font-semibold text-primary">Cardápio</p>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
          Gerenciador de produtos
        </h1>
        <p className="mt-3 text-base leading-7 text-muted-foreground">
          Organize as categorias e os produtos que aparecem no seu cardápio.
        </p>
      </header>
      <form
        className="mt-10 flex max-w-2xl gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          if (canCreateCategory) createCategoryMutation.mutate()
        }}
      >
        <Input
          placeholder="Nova categoria, por exemplo: Lanches"
          value={newCategoryName}
          onChange={(event) => setNewCategoryName(event.target.value)}
        />
        <Button
          type="submit"
          disabled={!canCreateCategory || createCategoryMutation.isPending}
        >
          {createCategoryMutation.isPending ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <FolderPlus />
          )}
          Nova categoria
        </Button>
      </form>
      <div className="mt-6">
        {categoriesQuery.isPending ? (
          <p className="text-sm text-muted-foreground">Carregando categorias…</p>
        ) : categoriesQuery.isError ? (
          <p className="text-sm text-destructive">Não foi possível carregar as categorias.</p>
        ) : categories.length ? (
          <DndContext
            sensors={sensors}
            modifiers={[restrictToVerticalAxis]}
            collisionDetection={closestCenter}
            measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
            onDragStart={handleDragStart}
            onDragCancel={() => setActiveCategoryId(null)}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={categories.map((category) => category.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid gap-4">
                {categories.map((category) => (
                  <CategoryEditor
                    category={category}
                    key={category.id}
                  />
                ))}
              </div>
            </SortableContext>
            <DragOverlay
              adjustScale={false}
              dropAnimation={null}
            >
              {activeCategory ? (
                <div className="rounded-xl border border-primary/30 bg-card px-5 py-4 shadow-xl">
                  <p className="font-medium">{activeCategory.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {activeCategory.active ? 'Categoria ativa' : 'Categoria desativada'}
                  </p>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        ) : (
          <p className="rounded-xl border border-dashed border-border px-5 py-10 text-center text-sm text-muted-foreground">
            Crie a primeira categoria para começar a montar seu cardápio.
          </p>
        )}
      </div>
    </main>
  )
}
