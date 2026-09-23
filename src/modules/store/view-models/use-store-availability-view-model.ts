'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { useAuthSessionStore } from '@/modules/auth/store/auth-session.store'

import {
  createUnavailabilityPeriod,
  getOperatingHours,
  updateStoreAvailability,
} from '../api/store.api'
import type { OperatingWeekday, StoreAvailabilityMode } from '../schemas/store.schema'

export type ScheduleSlot = { weekday: OperatingWeekday; openTime: string; closeTime: string }

export const weekdays: Array<{ value: OperatingWeekday; label: string; short: string }> = [
  { value: 'SUNDAY', label: 'Domingo', short: 'D' },
  { value: 'MONDAY', label: 'Segunda', short: 'S' },
  { value: 'TUESDAY', label: 'Terça', short: 'T' },
  { value: 'WEDNESDAY', label: 'Quarta', short: 'Q' },
  { value: 'THURSDAY', label: 'Quinta', short: 'Q' },
  { value: 'FRIDAY', label: 'Sexta', short: 'S' },
  { value: 'SATURDAY', label: 'Sábado', short: 'S' },
]

export function useStoreAvailabilityViewModel(initialMode: StoreAvailabilityMode) {
  const accessToken = useAuthSessionStore((state) => state.session?.accessToken)
  const queryClient = useQueryClient()
  const hoursQuery = useQuery({
    queryKey: ['store-operating-hours'],
    queryFn: () => getOperatingHours(accessToken!),
    enabled: Boolean(accessToken),
  })
  const [modeOverride, setModeOverride] = useState<StoreAvailabilityMode | null>(null)
  const [slotsOverride, setSlotsOverride] = useState<ScheduleSlot[] | null>(null)
  const [activeTab, setActiveTab] = useState<'schedule' | 'unavailability'>('schedule')
  const [period, setPeriod] = useState({ startsAt: '', endsAt: '', reason: '' })
  const mode = modeOverride ?? initialMode
  const slots =
    slotsOverride ??
    (hoursQuery.data
      ? weekdays.flatMap((day) =>
          hoursQuery.data.data[day.value].map((slot) => ({
            weekday: day.value,
            openTime: slot.openTime,
            closeTime: slot.closeTime,
          })),
        )
      : [])

  const saveMutation = useMutation({
    mutationFn: () => updateStoreAvailability({ mode, operatingHours: slots }, accessToken!),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['current-store'] })
      void queryClient.invalidateQueries({ queryKey: ['store-operating-hours'] })
    },
  })
  const periodMutation = useMutation({
    mutationFn: () =>
      createUnavailabilityPeriod({ ...period, reason: period.reason || undefined }, accessToken!),
  })

  function addSlot(weekday: OperatingWeekday) {
    setSlotsOverride((current) => [
      ...(current ?? slots),
      { weekday, openTime: '09:00', closeTime: '18:00' },
    ])
  }
  function updateSlot(index: number, patch: Partial<ScheduleSlot>) {
    setSlotsOverride((current) =>
      (current ?? slots).map((slot, slotIndex) =>
        slotIndex === index ? { ...slot, ...patch } : slot,
      ),
    )
  }
  function removeSlot(index: number) {
    setSlotsOverride((current) => (current ?? slots).filter((_, slotIndex) => slotIndex !== index))
  }
  function submitPeriod() {
    periodMutation.mutate()
  }

  return {
    activeTab,
    setActiveTab,
    mode,
    setMode: setModeOverride,
    slots,
    addSlot,
    updateSlot,
    removeSlot,
    saveMutation,
    hoursQuery,
    period,
    setPeriod,
    periodMutation,
    submitPeriod,
  }
}
