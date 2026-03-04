export type ApiResponse<T> = {
  code: number
  message: string
  data: T
}

export type SessionListItem = {
  session_id: string
  name: string
  description: string | null
  max_agents_limit: number
}

export type SessionListData = {
  items: SessionListItem[]
  total: number
}

export type SessionDetailData = {
  session_id: string
  name: string
  description: string | null
  max_agents_limit: number
  created_at: string
  updated_at: string
}

export type SessionCreatePayload = {
  name: string
  description?: string | null
  max_agents_limit: number
}

export type SessionPatchPayload = Partial<{
  name: string
  description: string | null
  max_agents_limit: number
}>

export type SessionEventItem = {
  event_id: string
  world_time: number
  verb: string
  subject_uuid: string
  target_ref: string
  details: Record<string, unknown>
  schema_version: number
}

export type SessionEventsData = {
  items: SessionEventItem[]
  next_cursor: string | null
  has_more: boolean
}

export type SessionFormValues = {
  name: string
  description: string
  maxAgentsLimit: string
}

export type SessionValidationErrors = Partial<{
  name: string
  max_agents_limit: string
}>
