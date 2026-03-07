'use client'

import { Filter, Settings2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { SessionEventItem } from '@/features/sessions/types'

import { SessionEventCard } from './SessionEventCard'

type SessionEventTimelineProps = {
  events: SessionEventItem[]
  hasMore: boolean
  isLoadingMore: boolean
  loadMoreError: string | null
  onLoadMore: () => Promise<void>
}

export function SessionEventTimeline({
  events,
  hasMore,
  isLoadingMore,
  loadMoreError,
  onLoadMore,
}: SessionEventTimelineProps) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="flex items-center gap-2 text-lg font-bold tracking-tight">
          Activity Stream
        </h3>
        <div className="flex items-center gap-2">
          <Button size="icon-sm" variant="ghost" aria-label="Filter events">
            <Filter className="size-4" />
          </Button>
          <Button size="icon-sm" variant="ghost" aria-label="Event settings">
            <Settings2 className="size-4" />
          </Button>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          No activities found in this session.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {events.map((event) => (
            <SessionEventCard key={event.event_id} event={event} />
          ))}
        </div>
      )}

      {loadMoreError ? <p className="text-sm text-destructive">{loadMoreError}</p> : null}

      {hasMore ? (
        <Button
          variant="outline"
          className="w-fit"
          disabled={isLoadingMore}
          onClick={() => {
            void onLoadMore()
          }}
        >
          {isLoadingMore ? 'Loading...' : 'Load more events'}
        </Button>
      ) : (
        <p className="text-xs text-muted-foreground">No more events.</p>
      )}
    </section>
  )
}

