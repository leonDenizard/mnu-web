import { z } from 'zod'

export const currentStoreResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    name: z.string(),
    slug: z.string(),
    isOpen: z.boolean(),
    legalName: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    whatsapp: z.string().nullable(),
    addressLine: z.string().nullable(),
    addressNumber: z.string().nullable(),
    neighborhood: z.string().nullable(),
    city: z.string().nullable(),
    state: z.string().nullable(),
    zipCode: z.string().nullable(),
    supportsDelivery: z.boolean(),
    supportsPickup: z.boolean(),
    supportsDineIn: z.boolean(),
    autoAcceptOrders: z.boolean(),
    deliveryRadiusKm: z.number().nullable(),
    deliveryFeeCents: z.number().nullable(),
  }),
})

export const operatingHoursResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    SUNDAY: z.array(z.object({ id: z.string(), openTime: z.string(), closeTime: z.string() })),
    MONDAY: z.array(z.object({ id: z.string(), openTime: z.string(), closeTime: z.string() })),
    TUESDAY: z.array(z.object({ id: z.string(), openTime: z.string(), closeTime: z.string() })),
    WEDNESDAY: z.array(z.object({ id: z.string(), openTime: z.string(), closeTime: z.string() })),
    THURSDAY: z.array(z.object({ id: z.string(), openTime: z.string(), closeTime: z.string() })),
    FRIDAY: z.array(z.object({ id: z.string(), openTime: z.string(), closeTime: z.string() })),
    SATURDAY: z.array(z.object({ id: z.string(), openTime: z.string(), closeTime: z.string() })),
  }),
})

export const operatingHourResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    id: z.string(),
    weekday: z.string(),
    openTime: z.string(),
    closeTime: z.string(),
  }),
})

export type CurrentStore = z.infer<typeof currentStoreResponseSchema>['data']
export type OperatingWeekday = keyof z.infer<typeof operatingHoursResponseSchema>['data']
