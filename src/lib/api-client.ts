import { z } from 'zod'

import { env } from './env'

const errorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional()
  })
})

export class ApiError extends Error {
  constructor(readonly code: string, message: string, readonly details?: unknown) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiRequest<T>(
  path: string,
  schema: z.ZodType<T>,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(`${env.apiUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers
    }
  })
  const body: unknown = await response.json()

  if (!response.ok) {
    const error = errorSchema.safeParse(body)
    if (error.success) throw new ApiError(error.data.error.code, error.data.error.message, error.data.error.details)
    throw new ApiError('HTTP_ERROR', 'Não foi possível concluir a solicitação.')
  }

  return schema.parse(body)
}
