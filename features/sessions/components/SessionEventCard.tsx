'use client'

import { Badge } from '@/components/ui/badge'

import { getEventPrimaryText } from '../services/sessionEventUtils'
import type { SessionEventItem } from '../types'
import { resolveEventTone } from './sessionDetailViewModel'

type SessionEventCardProps = {
  event: SessionEventItem
}

export function SessionEventCard({ event }: SessionEventCardProps) {
  const tone = resolveEventTone(event.verb)
  const primaryText = getEventPrimaryText(event)

  return (
    <article
      className={`rounded-lg border border-border/80 bg-background p-4 shadow-sm transition hover:shadow-md ${tone.borderClassName} border-l-4`}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge className={`rounded px-1.5 py-0 text-[10px] uppercase ${tone.badgeClassName}`}>
            {tone.label}
          </Badge>
          <span className="font-mono text-xs text-muted-foreground">
            world:{event.world_time}
          </span>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground">{event.event_id}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="font-semibold">{event.subject_uuid}</span>
        <span className="text-muted-foreground italic">triggered</span>
        <span className={`font-semibold ${tone.accentTextClassName}`}>{event.verb}</span>
      </div>

      <p className="pt-2 text-sm text-foreground/90">{primaryText}</p>
      <p className="pt-1 text-xs text-muted-foreground">target: {event.target_ref}</p>
    </article>
  )
}

