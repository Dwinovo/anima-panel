import type {
  ApiResponse,
  SessionCreatePayload,
  SessionDetailData,
  SessionEventItem,
  SessionEventsData,
  SessionListData,
  SessionListItem,
  SessionPatchPayload,
} from '../types'

const SESSION_API_PATH = '/api/v1/sessions'
const API_BASE_URL = process.env.NEXT_PUBLIC_ANIMA_API_BASE_URL ?? ''

export class SessionApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'SessionApiError'
    this.status = status
  }
}

export function getSessionErrorMessage(status: number): string {
  if (status === 400) {
    return '请求参数校验失败，请检查表单字段。'
  }

  if (status === 404) {
    return 'Session 不存在，请刷新列表后重试。'
  }

  if (status >= 500) {
    return '服务器异常，请稍后重试。'
  }

  return '请求失败，请稍后重试。'
}

export function buildSessionApiUrl(path: string, baseUrl: string): string {
  const normalizedBaseUrl = baseUrl.trim().replace(/\/+$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  if (normalizedBaseUrl.length === 0) {
    return normalizedPath
  }

  return `${normalizedBaseUrl}${normalizedPath}`
}

type SessionEventsApiUrlParams = {
  sessionId: string
  limit: number
  cursor: string | null
  baseUrl: string
}

export function buildSessionEventsApiUrl({
  sessionId,
  limit,
  cursor,
  baseUrl,
}: SessionEventsApiUrlParams): string {
  const basePath = buildSessionApiUrl(`/api/v1/sessions/${sessionId}/events`, baseUrl)
  const params = new URLSearchParams({
    limit: String(limit),
  })

  if (cursor && cursor.trim().length > 0) {
    params.set('cursor', cursor)
  }

  return `${basePath}?${params.toString()}`
}

function isApiResponse<T>(value: unknown): value is ApiResponse<T> {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.code === 'number' &&
    typeof candidate.message === 'string' &&
    'data' in candidate
  )
}

async function parseJsonBody(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch {
    return null
  }
}

async function parseApiResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T
  }

  const body = await parseJsonBody(response)

  if (!response.ok) {
    const fallbackMessage = getSessionErrorMessage(response.status)

    if (isApiResponse<unknown>(body) && body.message.trim().length > 0) {
      throw new SessionApiError(response.status, body.message)
    }

    throw new SessionApiError(response.status, fallbackMessage)
  }

  if (!isApiResponse<T>(body)) {
    throw new SessionApiError(response.status, '服务响应格式异常，请稍后重试。')
  }

  return body.data
}

async function requestSessionApi<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })

  return parseApiResponse<T>(response)
}

export async function listSessions(): Promise<SessionListItem[]> {
  const data = await requestSessionApi<SessionListData>(
    buildSessionApiUrl(SESSION_API_PATH, API_BASE_URL),
  )
  return data.items
}

export async function getSessionById(sessionId: string): Promise<SessionDetailData> {
  return requestSessionApi<SessionDetailData>(
    buildSessionApiUrl(`${SESSION_API_PATH}/${sessionId}`, API_BASE_URL),
  )
}

export async function createSession(
  payload: SessionCreatePayload,
): Promise<SessionDetailData> {
  return requestSessionApi<SessionDetailData>(
    buildSessionApiUrl(SESSION_API_PATH, API_BASE_URL),
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  )
}

export async function updateSession(
  sessionId: string,
  payload: SessionPatchPayload,
): Promise<SessionDetailData> {
  return requestSessionApi<SessionDetailData>(
    buildSessionApiUrl(`${SESSION_API_PATH}/${sessionId}`, API_BASE_URL),
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  )
}

export async function deleteSession(sessionId: string): Promise<void> {
  await requestSessionApi<void>(
    buildSessionApiUrl(`${SESSION_API_PATH}/${sessionId}`, API_BASE_URL),
    {
      method: 'DELETE',
    },
  )
}

type ListSessionEventsParams = {
  sessionId: string
  limit?: number
  cursor?: string | null
}

export async function listSessionEvents({
  sessionId,
  limit = 20,
  cursor = null,
}: ListSessionEventsParams): Promise<SessionEventsData> {
  return requestSessionApi<SessionEventsData>(
    buildSessionEventsApiUrl({
      sessionId,
      limit,
      cursor,
      baseUrl: API_BASE_URL,
    }),
  )
}

export type SessionEventPage = {
  items: SessionEventItem[]
  nextCursor: string | null
  hasMore: boolean
}

export function toSessionEventPage(data: SessionEventsData): SessionEventPage {
  return {
    items: data.items,
    nextCursor: data.next_cursor,
    hasMore: data.has_more,
  }
}
