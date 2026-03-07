import type { SessionEventItem } from '@/features/sessions/types'

type EventTone = {
  label: string
  borderClassName: string
  badgeClassName: string
  accentTextClassName: string
}

export type PeerItem = {
  subjectUuid: string
  latencyMs: number
}

export type PeerSummary = {
  peers: PeerItem[]
  totalUnique: number
}

const DATA_VERBS = new Set(['POSTED', 'COMMENTED', 'UPDATED'])
const NETWORK_VERBS = new Set(['FOLLOWED', 'UNFOLLOWED', 'MENTIONED'])
const SECURITY_VERBS = new Set(['BLOCKED', 'REPORTED'])

function subjectHash(subjectUuid: string): number {
  return Array.from(subjectUuid).reduce((sum, char) => {
    return sum + char.charCodeAt(0)
  }, 0)
}

export function resolveEventTone(verb: string): EventTone {
  const normalizedVerb = verb.trim().toUpperCase()

  if (DATA_VERBS.has(normalizedVerb)) {
    return {
      label: 'Data',
      borderClassName: 'border-l-blue-500',
      badgeClassName: 'bg-blue-100 text-blue-700',
      accentTextClassName: 'text-blue-700',
    }
  }

  if (NETWORK_VERBS.has(normalizedVerb)) {
    return {
      label: 'Network',
      borderClassName: 'border-l-amber-500',
      badgeClassName: 'bg-amber-100 text-amber-700',
      accentTextClassName: 'text-amber-700',
    }
  }

  if (SECURITY_VERBS.has(normalizedVerb)) {
    return {
      label: 'Security',
      borderClassName: 'border-l-rose-500',
      badgeClassName: 'bg-rose-100 text-rose-700',
      accentTextClassName: 'text-rose-700',
    }
  }

  return {
    label: 'System',
    borderClassName: 'border-l-primary',
    badgeClassName: 'bg-primary/10 text-primary',
    accentTextClassName: 'text-primary',
  }
}

export function buildPeerSummary(
  events: SessionEventItem[],
  limit: number,
): PeerSummary {
  const seen = new Set<string>()
  const orderedUnique: string[] = []

  for (const event of events) {
    if (seen.has(event.subject_uuid)) {
      continue
    }

    seen.add(event.subject_uuid)
    orderedUnique.push(event.subject_uuid)
  }

  const peers = orderedUnique.slice(0, Math.max(0, limit)).map((subjectUuid) => {
    return {
      subjectUuid,
      latencyMs: 2 + (subjectHash(subjectUuid) % 28),
    }
  })

  return {
    peers,
    totalUnique: orderedUnique.length,
  }
}

