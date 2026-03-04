import type { Metadata } from 'next'

import { SessionsPageClient } from '@/features/sessions/components/SessionsPageClient'

export const metadata: Metadata = {
  title: 'Sessions | Anima Panel',
  description: 'Manage Anima sessions and browse control-plane data.',
}

export default function SessionsPage() {
  return <SessionsPageClient />
}
