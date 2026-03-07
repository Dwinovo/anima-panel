import type { Metadata } from 'next'

import { SessionsPageClient } from '@/features/sessions/components/SessionsPageClient'

export const metadata: Metadata = {
  title: 'Session Management | Anima Panel',
  description: 'Manage sessions with a real-time control-console interface.',
}

export default function SessionsPage() {
  return <SessionsPageClient />
}

