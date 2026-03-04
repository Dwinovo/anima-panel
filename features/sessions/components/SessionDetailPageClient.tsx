'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'

import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  SessionApiError,
  getSessionById,
  getSessionErrorMessage,
  listSessionEvents,
  toSessionEventPage,
} from '@/features/sessions/services/sessionService'
import type { SessionDetailData, SessionEventItem } from '@/features/sessions/types'

import { SessionEventTimeline } from './SessionEventTimeline'

type SessionDetailPageClientProps = {
  sessionId: string
}

const DEFAULT_EVENT_LIMIT = 20

function resolveErrorMessage(error: unknown): string {
  if (error instanceof SessionApiError) {
    return error.message
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message
  }

  return getSessionErrorMessage(500)
}

function LoadingState() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-36 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  )
}

export function SessionDetailPageClient({ sessionId }: SessionDetailPageClientProps) {
  const [session, setSession] = useState<SessionDetailData | null>(null)
  const [events, setEvents] = useState<SessionEventItem[]>([])

  const [isLoading, setIsLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)

  const [hasMore, setHasMore] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null)

  const loadPage = useCallback(async () => {
    setIsLoading(true)
    setPageError(null)
    setLoadMoreError(null)

    try {
      const [sessionData, eventsData] = await Promise.all([
        getSessionById(sessionId),
        listSessionEvents({
          sessionId,
          limit: DEFAULT_EVENT_LIMIT,
        }),
      ])

      const firstPage = toSessionEventPage(eventsData)

      setSession(sessionData)
      setEvents(firstPage.items)
      setHasMore(firstPage.hasMore)
      setNextCursor(firstPage.nextCursor)
    } catch (error) {
      setPageError(resolveErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }, [sessionId])

  useEffect(() => {
    void loadPage()
  }, [loadPage])

  const handleLoadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore) {
      return
    }

    setIsLoadingMore(true)
    setLoadMoreError(null)

    try {
      const pageData = await listSessionEvents({
        sessionId,
        limit: DEFAULT_EVENT_LIMIT,
        cursor: nextCursor,
      })

      const page = toSessionEventPage(pageData)

      setEvents((current) => [...current, ...page.items])
      setHasMore(page.hasMore)
      setNextCursor(page.nextCursor)
    } catch (error) {
      setLoadMoreError(resolveErrorMessage(error))
    } finally {
      setIsLoadingMore(false)
    }
  }, [hasMore, isLoadingMore, nextCursor, sessionId])

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-4 py-8 md:px-8">
      <header className="flex items-center justify-between gap-3">
        <Button asChild variant="ghost" className="w-fit">
          <Link href="/sessions">
            <ArrowLeft className="size-4" />
            Back to sessions
          </Link>
        </Button>
      </header>

      {isLoading ? <LoadingState /> : null}

      {!isLoading && pageError ? (
        <Card>
          <CardHeader>
            <CardTitle>Failed to load session detail</CardTitle>
            <CardDescription>{pageError}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => void loadPage()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {!isLoading && !pageError && session ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{session.name}</CardTitle>
              <CardDescription>Session control-plane summary</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase text-muted-foreground">Session ID</p>
                <p className="font-mono text-sm">{session.session_id}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Max agents</p>
                <p className="text-sm">{session.max_agents_limit}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs uppercase text-muted-foreground">Description</p>
                <p className="text-sm text-muted-foreground">{session.description ?? '-'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Event timeline</CardTitle>
              <CardDescription>
                Ordered by backend: world_time DESC, event_id DESC.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SessionEventTimeline
                events={events}
                hasMore={hasMore}
                isLoadingMore={isLoadingMore}
                loadMoreError={loadMoreError}
                onLoadMore={handleLoadMore}
              />
            </CardContent>
          </Card>
        </>
      ) : null}
    </main>
  )
}
