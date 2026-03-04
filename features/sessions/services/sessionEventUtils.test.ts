import { describe, expect, it } from 'vitest'

import type { SessionEventItem } from '../types'

import { getEventPrimaryText } from './sessionEventUtils'

function buildEvent(overrides: Partial<SessionEventItem>): SessionEventItem {
  return {
    event_id: 'event_001',
    world_time: 100,
    verb: 'POSTED',
    subject_uuid: 'agent_001',
    target_ref: 'board:session_demo_001',
    details: {},
    schema_version: 1,
    ...overrides,
  }
}

describe('getEventPrimaryText', () => {
  it('returns details.content for posted event when content is string', () => {
    const event = buildEvent({
      verb: 'POSTED',
      details: { content: 'hello world' },
    })

    expect(getEventPrimaryText(event)).toBe('hello world')
  })

  it('returns fallback sentence for non-posted event', () => {
    const event = buildEvent({
      verb: 'FOLLOWED',
      target_ref: 'agent:agent_002',
    })

    expect(getEventPrimaryText(event)).toBe('FOLLOWED agent:agent_002')
  })

  it('returns fallback sentence when posted content is missing', () => {
    const event = buildEvent({
      verb: 'POSTED',
      details: {},
      target_ref: 'board:session_demo_001',
    })

    expect(getEventPrimaryText(event)).toBe('POSTED board:session_demo_001')
  })
})
