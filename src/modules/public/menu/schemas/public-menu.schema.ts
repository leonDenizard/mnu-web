import { z } from 'zod'

const publicMenuOptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  image: z.string().nullable(),
  price: z.number(),
  maxQuantity: z.number().nullable(),
  displayOrder: z.number(),
})

const publicMenuModifierGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  required: z.boolean(),
  minSelections: z.number(),
  maxSelections: z.number(),
  displayOrder: z.number(),
  options: z.array(publicMenuOptionSchema),
})

const publicMenuProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().nullable(),
  description: z.string().nullable(),
  image: z.string().nullable(),
  promotionalPrice: z.number().nullable(),
  displayOrder: z.number().nullable(),
  modifierGroups: z.array(publicMenuModifierGroupSchema),
})

export const publicMenuResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    addressLine: z.string().nullable(),
    addressNumber: z.string().nullable(),
    neighborhood: z.string().nullable(),
    isOpen: z.boolean(),
    supportsDelivery: z.boolean(),
    supportsPickup: z.boolean(),
    supportsDineIn: z.boolean(),
    deliveryFeeCents: z.number().nullable(),
    categories: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        displayOrder: z.number(),
        products: z.array(publicMenuProductSchema),
      }),
    ),
  }),
})

export type PublicMenu = z.infer<typeof publicMenuResponseSchema>['data']
