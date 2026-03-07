import type { Metadata } from 'next'

import { SessionDetailPageClient } from '@/features/sessions/components/SessionDetailPageClient'

type SessionDetailPageProps = {
  params: Promise<{
    sessionId: string
  }>
}

export const metadata: Metadata = {
  title: 'Session Detail | Anima Panel',
  description: 'Inspect session activity feed and runtime context.',
}

export default async function SessionDetailPage({
  params,
}: SessionDetailPageProps) {
  const { sessionId } = await params

  return <SessionDetailPageClient sessionId={sessionId} />
}
