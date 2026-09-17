import { env } from '@/lib/env'

import { publicMenuResponseSchema, type PublicMenu } from '../schemas/public-menu.schema'

export async function getPublicMenu(slug: string): Promise<PublicMenu | null> {
  const response = await fetch(`${env.apiUrl}/api/public/menu/${encodeURIComponent(slug)}`, {
    cache: 'no-store'
  })

  if (response.status === 404) return null
  if (!response.ok) throw new Error('Não foi possível carregar o cardápio.')

  return publicMenuResponseSchema.parse(await response.json()).data
}
