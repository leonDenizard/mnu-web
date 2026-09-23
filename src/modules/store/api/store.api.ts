import { apiRequest } from '@/lib/api-client'
import { z } from 'zod'

import {
  currentStoreResponseSchema,
  operatingHourResponseSchema,
  operatingHoursResponseSchema,
  type OperatingWeekday,
  type StoreAvailabilityMode,
} from '../schemas/store.schema'

const successSchema = z.object({ success: z.literal(true) })

type UpdateStoreInput = Partial<{
  name: string
  legalName: string
  phone: string
  whatsapp: string
  addressLine: string
  addressNumber: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
  supportsDelivery: boolean
  supportsPickup: boolean
  supportsDineIn: boolean
  autoAcceptOrders: boolean
  deliveryRadiusKm: number
  deliveryFeeCents: number
}>

export function getCurrentStore(accessToken: string) {
  return apiRequest('/api/stores/me', currentStoreResponseSchema, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
}

export function updateCurrentStore(input: UpdateStoreInput, accessToken: string) {
  return apiRequest('/api/stores/me', currentStoreResponseSchema, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(input),
  })
}

export function setStoreOpen(isOpen: boolean, accessToken: string) {
  return apiRequest(`/api/stores/me/${isOpen ? 'open' : 'close'}`, currentStoreResponseSchema, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${accessToken}` },
  })
}

export function getOperatingHours(accessToken: string) {
  return apiRequest('/api/stores/me/operating-hours', operatingHoursResponseSchema, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
}

export function createOperatingHour(
  input: { weekday: OperatingWeekday; openTime: string; closeTime: string },
  accessToken: string,
) {
  return apiRequest('/api/stores/me/operating-hours', operatingHourResponseSchema, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(input),
  })
}

export function deleteOperatingHour(hourId: string, accessToken: string) {
  return apiRequest(`/api/stores/me/operating-hours/${hourId}`, operatingHoursResponseSchema, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  })
}

export function updateStoreAvailability(
  input: {
    mode: StoreAvailabilityMode
    operatingHours: Array<{ weekday: OperatingWeekday; openTime: string; closeTime: string }>
  },
  accessToken: string,
) {
  return apiRequest('/api/stores/me/availability', successSchema, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(input),
  })
}

export function createUnavailabilityPeriod(
  input: { startsAt: string; endsAt: string; reason?: string },
  accessToken: string,
) {
  return apiRequest(
    '/api/stores/me/unavailability-periods',
    z.object({ success: z.literal(true) }),
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(input),
    },
  )
}
