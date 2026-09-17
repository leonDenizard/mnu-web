import type { ReactNode } from 'react'

import { DashboardShell } from '@/features/dashboard/views/dashboard-shell'

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>
}
