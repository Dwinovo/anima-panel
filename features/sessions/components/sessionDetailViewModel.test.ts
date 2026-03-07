import { describe, expect, it } from 'vitest'

import type { SessionEventItem } from '@/features/sessions/types'

import { buildPeerSummary, resolveEventTone } from './sessionDetailViewModel'

function buildEvent(overrides: Partial<SessionEventItem>): SessionEventItem {
  return {
    event_id: 'event_001',
    world_time: 12006,
    verb: 'POSTED',
    subject_uuid: 'agent_alpha',
    target_ref: 'board:session_demo_001',
    details: {},
    schema_version: 1,
    ...overrides,
  }
}

describe('resolveEventTone', () => {
  it('maps posted events to data tone', () => {
    const tone = resolveEventTone('POSTED')

    expect(tone.label).toBe('Data')
    expect(tone.borderClassName).toContain('border-l-blue-500')
  })

  it('maps followed events to network tone', () => {
    const tone = resolveEventTone('FOLLOWED')

    expect(tone.label).toBe('Network')
    expect(tone.borderClassName).toContain('border-l-amber-500')
  })

  it('maps unknown events to system tone', () => {
    const tone = resolveEventTone('UNKNOWN_EVENT')

    expect(tone.label).toBe('System')
    expect(tone.borderClassName).toContain('border-l-primary')
  })
})

describe('buildPeerSummary', () => {
  it('deduplicates peers and respects limit', () => {
    const result = buildPeerSummary(
      [
        buildEvent({ subject_uuid: 'agent_alpha' }),
        buildEvent({ event_id: 'event_002', subject_uuid: 'agent_beta' }),
        buildEvent({ event_id: 'event_003', subject_uuid: 'agent_alpha' }),
        buildEvent({ event_id: 'event_004', subject_uuid: 'agent_gamma' }),
      ],
      2,
    )

    expect(result.totalUnique).toBe(3)
    expect(result.peers).toHaveLength(2)
    expect(result.peers.map((peer) => peer.subjectUuid)).toEqual([
      'agent_alpha',
      'agent_beta',
    ])
    expect(result.peers[0].latencyMs).toBeGreaterThanOrEqual(2)
    expect(result.peers[0].latencyMs).toBeLessThanOrEqual(29)
  })

  it('returns empty peers for empty events', () => {
    const result = buildPeerSummary([], 3)

    expect(result).toEqual({
      peers: [],
      totalUnique: 0,
    })
  })
})

