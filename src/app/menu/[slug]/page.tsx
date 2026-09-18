import { notFound } from 'next/navigation'

import { getPublicMenu } from '@/features/public/menu/api/public-menu.api'
import { PublicMenuView } from '@/features/public/menu/views/public-menu-view'

export default async function PublicMenuPage({ params }: PageProps<'/menu/[slug]'>) {
  const { slug } = await params
  const menu = await getPublicMenu(slug)

  if (!menu) notFound()

  return <PublicMenuView menu={menu} />
}
