'use client'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
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
  if (events.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-10 text-center">
        <p className="text-sm text-muted-foreground">
          No events found in this session.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <div key={event.event_id} className="space-y-4">
          <SessionEventCard event={event} />
          {index !== events.length - 1 ? <Separator /> : null}
        </div>
      ))}

      {loadMoreError ? <p className="text-sm text-destructive">{loadMoreError}</p> : null}

      {hasMore ? (
        <Button
          variant="outline"
          disabled={isLoadingMore}
          onClick={() => {
            void onLoadMore()
          }}
        >
          {isLoadingMore ? 'Loading...' : 'Load more'}
        </Button>
      ) : (
        <p className="text-xs text-muted-foreground">No more events.</p>
      )}
    </div>
  )
}
