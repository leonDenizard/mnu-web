import { apiRequest } from '@/lib/api-client'

import { anotaAiImportResponseSchema } from '../schemas/anota-ai-import.schema'

export function importAnotaAiMenu(file: File, accessToken: string) {
  const formData = new FormData()
  formData.append('file', file)

  return apiRequest('/api/menu/imports/anota-ai', anotaAiImportResponseSchema, {
    method: 'POST',
    body: formData,
    headers: { Authorization: `Bearer ${accessToken}` }
  })
}
