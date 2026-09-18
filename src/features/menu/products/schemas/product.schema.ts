import { z } from 'zod'

export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().nullable(),
  description: z.string().nullable(),
  image: z.string().nullable(),
  promotionalPrice: z.number().nullable(),
  active: z.boolean(),
  displayOrder: z.number().nullable(),
  categoryId: z.string(),
  storeId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const productsResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(productSchema),
  meta: z.object({ total: z.number(), page: z.number(), lastPage: z.number() }),
})

export const productResponseSchema = z.object({ success: z.literal(true), data: productSchema })

export type Product = z.infer<typeof productSchema>
export type ProductInput = {
  name: string
  price: number
  categoryId: string
  active?: boolean
}
