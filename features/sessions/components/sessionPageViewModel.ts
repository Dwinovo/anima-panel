import type { SessionListItem } from '@/features/sessions/types'

export type SessionsStats = {
  activeSessions: number
  totalCapacity: number
  averageCapacity: number
}

export function filterSessionsByQuery(
  sessions: SessionListItem[],
  query: string,
): SessionListItem[] {
  const normalizedQuery = query.trim().toLowerCase()

  if (normalizedQuery.length === 0) {
    return sessions
  }

  return sessions.filter((session) => {
    const description = session.description ?? ''
    const haystack = `${session.session_id} ${session.name} ${description}`.toLowerCase()
    return haystack.includes(normalizedQuery)
  })
}

export function buildSessionsStats(
  sessions: SessionListItem[],
): SessionsStats {
  const activeSessions = sessions.length

  if (activeSessions === 0) {
    return {
      activeSessions: 0,
      totalCapacity: 0,
      averageCapacity: 0,
    }
  }

  const totalCapacity = sessions.reduce((sum, session) => {
    return sum + session.max_agents_limit
  }, 0)

  return {
    activeSessions,
    totalCapacity,
    averageCapacity: Math.round(totalCapacity / activeSessions),
  }
}

