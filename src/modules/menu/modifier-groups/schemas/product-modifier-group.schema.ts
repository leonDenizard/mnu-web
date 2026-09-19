import { z } from 'zod'

export const modifierOptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  description: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  displayOrder: z.number(),
})

export const productModifierGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  surname: z.string().nullable().optional(),
  active: z.boolean(),
  required: z.boolean(),
  minSelections: z.number(),
  maxSelections: z.number(),
  displayOrder: z.number(),
  options: z.array(modifierOptionSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const productModifierGroupsResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(productModifierGroupSchema),
})

export const productModifierGroupResponseSchema = z.object({
  success: z.literal(true),
  data: productModifierGroupSchema.omit({ options: true }),
})

export type ProductModifierGroup = z.infer<typeof productModifierGroupSchema>
export type ModifierOption = z.infer<typeof modifierOptionSchema>
