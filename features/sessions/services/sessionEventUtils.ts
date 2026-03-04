import type { SessionEventItem } from '../types'

function readContent(details: Record<string, unknown>): string | null {
  const value = details.content

  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export function getEventPrimaryText(event: SessionEventItem): string {
  if (event.verb === 'POSTED') {
    const content = readContent(event.details)

    if (content) {
      return content
    }
  }

  return `${event.verb} ${event.target_ref}`
}
