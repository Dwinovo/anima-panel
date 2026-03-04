import { describe, expect, it } from 'vitest'

import { validateSessionPayload } from './sessionValidation'

describe('validateSessionPayload', () => {
  it('returns name error when name is empty', () => {
    const result = validateSessionPayload({
      name: '',
      description: 'desc',
      max_agents_limit: 10,
    })

    expect(result.isValid).toBe(false)
    expect(result.errors.name).toBe('名称不能为空')
  })

  it('returns max agents error when max_agents_limit is not a positive integer', () => {
    const result = validateSessionPayload({
      name: 'Demo',
      description: null,
      max_agents_limit: 0,
    })

    expect(result.isValid).toBe(false)
    expect(result.errors.max_agents_limit).toBe('容量必须是正整数')
  })

  it('passes validation for a valid payload', () => {
    const result = validateSessionPayload({
      name: 'Demo Session',
      description: 'For test',
      max_agents_limit: 100,
    })

    expect(result.isValid).toBe(true)
    expect(result.errors).toEqual({})
  })
})
