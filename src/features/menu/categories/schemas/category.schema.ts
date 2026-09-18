import { z } from 'zod'

export const categorySchema = z.object({
  id: z.string(),
  title: z.string(),
  active: z.boolean(),
  displayOrder: z.number(),
  showInMenu: z.boolean(),
  showInPos: z.boolean(),
  showInWaiter: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const categoriesResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(categorySchema),
  meta: z.object({ total: z.number(), page: z.number(), lastPage: z.number() }),
})

export const categoryResponseSchema = z.object({ success: z.literal(true), data: categorySchema })

export type Category = z.infer<typeof categorySchema>
export type CategoryInput = Pick<Category, 'title' | 'active' | 'displayOrder' | 'showInMenu' | 'showInPos' | 'showInWaiter'>
