import type {
  SessionCreatePayload,
  SessionFormValues,
  SessionValidationErrors,
} from '../types'

export type SessionValidationResult = {
  isValid: boolean
  errors: SessionValidationErrors
}

export function normalizeSessionPayload(
  values: SessionFormValues,
): SessionCreatePayload {
  const normalizedName = values.name.trim()
  const normalizedDescription = values.description.trim()

  return {
    name: normalizedName,
    description: normalizedDescription.length > 0 ? normalizedDescription : null,
    max_agents_limit: Number.parseInt(values.maxAgentsLimit, 10),
  }
}

export function validateSessionPayload(
  payload: SessionCreatePayload,
): SessionValidationResult {
  const errors: SessionValidationErrors = {}

  if (payload.name.trim().length === 0) {
    errors.name = '名称不能为空'
  }

  if (
    !Number.isInteger(payload.max_agents_limit) ||
    payload.max_agents_limit <= 0
  ) {
    errors.max_agents_limit = '容量必须是正整数'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}
