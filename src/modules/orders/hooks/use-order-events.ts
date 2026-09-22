'use client'

import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { useAuthSessionStore } from '@/modules/auth/store/auth-session.store'

const initialReconnectDelay = 2_000
const maximumReconnectDelay = 60_000

type StreamEvent = {
  id?: string
  event?: string
  data?: string
}

function parseEvent(block: string): StreamEvent | null {
  const event = block.split('\n').reduce<StreamEvent>((parsed, line) => {
    const separator = line.indexOf(':')
    if (separator === -1) return parsed

    const field = line.slice(0, separator)
    const value = line.slice(separator + 1).trimStart()
    if (field === 'id') parsed.id = value
    if (field === 'event') parsed.event = value
    if (field === 'data') parsed.data = parsed.data ? `${parsed.data}\n${value}` : value
    return parsed
  }, {})

  return event.event || event.data ? event : null
}

function getReconnectDelay(response: Response | undefined, attempt: number) {
  const retryAfter = response?.headers.get('Retry-After')
  const seconds = retryAfter ? Number(retryAfter) : NaN
  if (Number.isFinite(seconds) && seconds > 0) return seconds * 1_000

  return Math.min(initialReconnectDelay * 2 ** attempt, maximumReconnectDelay)
}

/** Keeps the order board in sync with store events while preserving bearer authentication. */
export function useOrderEvents() {
  const accessToken = useAuthSessionStore((state) => state.session?.accessToken)
  const clearSession = useAuthSessionStore((state) => state.clearSession)
  const queryClient = useQueryClient()
  const cursorRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    if (!accessToken) return

    let reconnectTimer: ReturnType<typeof setTimeout> | undefined
    let cancelled = false
    let controller: AbortController | undefined
    let reconnectAttempt = 0

    const connect = async () => {
      controller = new AbortController()
      let response: Response | undefined

      try {
        const headers = new Headers({
          Accept: 'text/event-stream',
          Authorization: `Bearer ${accessToken}`,
          'Cache-Control': 'no-cache',
        })
        if (cursorRef.current) headers.set('Last-Event-ID', cursorRef.current)

        response = await fetch('/api/orders/events', {
          headers,
          signal: controller.signal,
        })

        if (response.status === 401) {
          clearSession()
          return
        }

        if (!response.ok || !response.body) throw new Error('Order event stream unavailable')

        reconnectAttempt = 0

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (!cancelled) {
          const { done, value } = await reader.read()
          if (done) break

          // A CRLF delimiter can be split across chunks. Normalize only after
          // appending so the parser always sees a complete SSE frame boundary.
          buffer = `${buffer}${decoder.decode(value, { stream: true })}`.replace(/\r\n/g, '\n')
          const blocks = buffer.split('\n\n')
          buffer = blocks.pop() ?? ''

          for (const block of blocks) {
            if (!block || block.startsWith(':')) continue
            const event = parseEvent(block)
            if (!event) continue
            if (event.id) cursorRef.current = event.id

            if (
              event.event === 'stream.ready' ||
              event.event === 'order.created' ||
              event.event === 'order.status.changed'
            ) {
              void queryClient.refetchQueries({ queryKey: ['orders'], type: 'active' })
            }
          }
        }
      } catch {
        if (controller.signal.aborted || cancelled) return
      }

      if (!cancelled) {
        const delay = getReconnectDelay(response, reconnectAttempt)
        reconnectAttempt += 1
        reconnectTimer = setTimeout(connect, delay)
      }
    }

    void connect()

    return () => {
      cancelled = true
      controller?.abort()
      if (reconnectTimer) clearTimeout(reconnectTimer)
    }
  }, [accessToken, clearSession, queryClient])
}
