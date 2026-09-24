'use client'

import { useEffect, useState } from 'react'

type StoreAvailabilityEvent = {
  isOpen?: boolean
}

/** Keeps the public menu availability badge current without polling. */
export function usePublicStoreAvailability(
  slug: string,
  initialIsOpen: boolean,
  onStoreClosed?: () => void,
) {
  const [isOpen, setIsOpen] = useState(initialIsOpen)

  useEffect(() => {
    const events = new EventSource(`/api/public/menu/${encodeURIComponent(slug)}/events`)

    function handleAvailabilityChange(event: MessageEvent<string>) {
      try {
        const payload = JSON.parse(event.data) as StoreAvailabilityEvent
        if (typeof payload.isOpen === 'boolean') {
          setIsOpen(payload.isOpen)
          if (!payload.isOpen) onStoreClosed?.()
        }
      } catch {
        // Ignore malformed stream payloads and keep the last known state.
      }
    }

    events.addEventListener('store.availability.changed', handleAvailabilityChange)

    return () => {
      events.removeEventListener('store.availability.changed', handleAvailabilityChange)
      events.close()
    }
  }, [onStoreClosed, slug])

  return isOpen
}
