import { describe, expect, it } from 'vitest'

import {
  buildSessionApiUrl,
  buildSessionEventsApiUrl,
  getSessionErrorMessage,
} from './sessionService'

describe('getSessionErrorMessage', () => {
  it('maps 400 to field validation message', () => {
    expect(getSessionErrorMessage(400)).toBe('请求参数校验失败，请检查表单字段。')
  })

  it('maps 404 to not found message', () => {
    expect(getSessionErrorMessage(404)).toBe('Session 不存在，请刷新列表后重试。')
  })

  it('maps 500 to generic retry message', () => {
    expect(getSessionErrorMessage(500)).toBe('服务器异常，请稍后重试。')
  })

  it('maps unknown status to default message', () => {
    expect(getSessionErrorMessage(418)).toBe('请求失败，请稍后重试。')
  })
})

describe('buildSessionApiUrl', () => {
  it('uses relative path when NEXT_PUBLIC_ANIMA_API_BASE_URL is empty', () => {
    expect(buildSessionApiUrl('/api/v1/sessions', '')).toBe('/api/v1/sessions')
  })

  it('uses configured host when NEXT_PUBLIC_ANIMA_API_BASE_URL exists', () => {
    expect(buildSessionApiUrl('/api/v1/sessions', 'http://localhost:8000')).toBe(
      'http://localhost:8000/api/v1/sessions',
    )
  })

  it('trims trailing slash from NEXT_PUBLIC_ANIMA_API_BASE_URL', () => {
    expect(buildSessionApiUrl('/api/v1/sessions', 'http://localhost:8000/')).toBe(
      'http://localhost:8000/api/v1/sessions',
    )
  })
})

describe('buildSessionEventsApiUrl', () => {
  it('builds events url with default limit when cursor is absent', () => {
    expect(
      buildSessionEventsApiUrl({
        sessionId: 'session_demo_001',
        limit: 20,
        cursor: null,
        baseUrl: 'http://localhost:8000',
      }),
    ).toBe('http://localhost:8000/api/v1/sessions/session_demo_001/events?limit=20')
  })

  it('builds events url with encoded cursor when cursor exists', () => {
    expect(
      buildSessionEventsApiUrl({
        sessionId: 'session_demo_001',
        limit: 20,
        cursor: '12006:event_31f9f7a5',
        baseUrl: 'http://localhost:8000/',
      }),
    ).toBe(
      'http://localhost:8000/api/v1/sessions/session_demo_001/events?limit=20&cursor=12006%3Aevent_31f9f7a5',
    )
  })
})
