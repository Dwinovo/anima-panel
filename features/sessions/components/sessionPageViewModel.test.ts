import { describe, expect, it } from 'vitest'

import type { SessionListItem } from '@/features/sessions/types'

import {
  buildSessionsStats,
  filterSessionsByQuery,
} from './sessionPageViewModel'

const MOCK_SESSIONS: SessionListItem[] = [
  {
    session_id: 'session-alpha-001',
    name: 'Alpha Production',
    description: 'Global production traffic',
    max_agents_limit: 500,
  },
  {
    session_id: 'session-beta-002',
    name: 'Beta Staging',
    description: 'Internal tests',
    max_agents_limit: 200,
  },
  {
    session_id: 'session-gamma-003',
    name: 'Gamma Sandbox',
    description: null,
    max_agents_limit: 100,
  },
]

describe('filterSessionsByQuery', () => {
  it('returns all sessions when query is empty', () => {
    expect(filterSessionsByQuery(MOCK_SESSIONS, '')).toEqual(MOCK_SESSIONS)
  })

  it('matches by session id', () => {
    expect(filterSessionsByQuery(MOCK_SESSIONS, 'beta-002')).toEqual([
      MOCK_SESSIONS[1],
    ])
  })

  it('matches by name case-insensitively', () => {
    expect(filterSessionsByQuery(MOCK_SESSIONS, 'alpha')).toEqual([
      MOCK_SESSIONS[0],
    ])
  })
})

describe('buildSessionsStats', () => {
  it('aggregates active, total capacity and average capacity', () => {
    expect(buildSessionsStats(MOCK_SESSIONS)).toEqual({
      activeSessions: 3,
      totalCapacity: 800,
      averageCapacity: 267,
    })
  })

  it('returns zeroed stats when list is empty', () => {
    expect(buildSessionsStats([])).toEqual({
      activeSessions: 0,
      totalCapacity: 0,
      averageCapacity: 0,
    })
  })
})

