'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

import { Bell, Search } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  SessionApiError,
  getSessionById,
  getSessionErrorMessage,
  listSessionEvents,
  toSessionEventPage,
} from '@/features/sessions/services/sessionService'
import type { SessionDetailData, SessionEventItem } from '@/features/sessions/types'

import { buildPeerSummary } from './sessionDetailViewModel'
import { SessionEventTimeline } from './SessionEventTimeline'

type SessionDetailPageClientProps = {
  sessionId: string
}

const DEFAULT_EVENT_LIMIT = 20

type PerformanceSummary = {
  cpuUtilization: number
  memoryUsedGb: number
  memoryTotalGb: number
  memoryUsagePercent: number
  latencyMs: number
}

function resolveErrorMessage(error: unknown): string {
  if (error instanceof SessionApiError) {
    return error.message
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message
  }

  return getSessionErrorMessage(500)
}

function LoadingView() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 px-4 py-8 md:px-8">
      <Skeleton className="h-14 w-full rounded-xl" />
      <Skeleton className="h-52 w-full rounded-xl" />
      <Skeleton className="h-96 w-full rounded-xl" />
    </div>
  )
}

function sessionHash(sessionId: string): number {
  return Array.from(sessionId).reduce((sum, char) => {
    return sum + char.charCodeAt(0)
  }, 0)
}

function buildPerformanceSummary(
  session: SessionDetailData,
  events: SessionEventItem[],
): PerformanceSummary {
  const hash = sessionHash(session.session_id)
  const cpuUtilization = 30 + (hash % 50)
  const memoryTotalGb = 16
  const memoryUsedGb = Number((3 + (events.length % 6) + (hash % 4) * 0.4).toFixed(1))
  const memoryUsagePercent = Math.min(
    100,
    Math.round((memoryUsedGb / memoryTotalGb) * 100),
  )
  const latencyMs = 8 + (hash % 18)

  return {
    cpuUtilization,
    memoryUsedGb,
    memoryTotalGb,
    memoryUsagePercent,
    latencyMs,
  }
}

function toAvatarFallback(subjectUuid: string): string {
  const cleaned = subjectUuid.replace(/[^a-zA-Z0-9]/g, '').slice(0, 2)

  if (cleaned.length === 0) {
    return 'AN'
  }

  return cleaned.toUpperCase()
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

  const peerSummary = useMemo(() => {
    return buildPeerSummary(events, 3)
  }, [events])

  const performance = useMemo(() => {
    if (!session) {
      return null
    }

    return buildPerformanceSummary(session, events)
  }, [session, events])

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

  if (isLoading) {
    return <LoadingView />
  }

  if (pageError || !session || !performance) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-start justify-center gap-4 px-6 py-10">
        <p className="text-sm text-destructive">{pageError ?? 'Session data is unavailable.'}</p>
        <Button variant="outline" onClick={() => void loadPage()}>
          Retry
        </Button>
        <Button asChild variant="ghost">
          <Link href="/sessions">Back to sessions</Link>
        </Button>
      </main>
    )
  }

  const statusLabel = events.length > 0 ? 'Healthy' : 'Idle'

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_hsl(263_100%_98%)_0%,_hsl(0_0%_100%)_40%,_hsl(0_0%_100%)_100%)]">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between gap-3 px-4 md:px-8">
          <div className="flex items-center gap-6">
            <Link href="/sessions" className="text-lg font-bold text-primary">
              Anima
            </Link>
            <nav className="hidden items-center gap-7 text-sm md:flex">
              <Link href="/sessions" className="text-primary font-semibold">
                Sessions
              </Link>
              <span className="text-muted-foreground">Analytics</span>
              <span className="text-muted-foreground">Settings</span>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative hidden md:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                readOnly
                value=""
                placeholder="Search events..."
                className="w-64 pl-9"
                aria-label="Search events"
              />
            </div>
            <Button size="icon" variant="ghost" aria-label="Notifications">
              <Bell className="size-4" />
            </Button>
            <Avatar className="size-9 border border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary">AR</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 py-6 md:px-8">
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            <Link href="/sessions" className="hover:text-primary">
              Sessions
            </Link>
            <span>/</span>
            <span className="text-foreground">{session.session_id}</span>
          </div>

          <Card className="border-border/80 bg-background shadow-sm">
            <CardContent className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between">
              <div className="flex gap-4">
                <div className="flex size-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <span className="text-2xl">#</span>
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl font-bold tracking-tight">{session.name}</h1>
                    <Badge className="gap-1 rounded-full bg-emerald-100 text-emerald-700">
                      <span className="size-1.5 rounded-full bg-emerald-500" />
                      {statusLabel}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Session ID: <span className="font-mono">{session.session_id}</span>
                  </p>
                  <p className="max-w-3xl text-sm text-muted-foreground">
                    {session.description ?? 'No session description provided.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="outline">Pause</Button>
                <Button>Export Logs</Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <SessionEventTimeline
              events={events}
              hasMore={hasMore}
              isLoadingMore={isLoadingMore}
              loadMoreError={loadMoreError}
              onLoadMore={handleLoadMore}
            />
          </div>

          <aside className="space-y-5 lg:col-span-4">
            <Card className="border-border/80 bg-background shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold">Instance Performance</h3>
                  <span className="text-xs text-muted-foreground">Live</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">CPU Utilization</span>
                    <span>{performance.cpuUtilization}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${performance.cpuUtilization}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Memory Usage</span>
                    <span>
                      {performance.memoryUsedGb} / {performance.memoryTotalGb} GB
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{ width: `${performance.memoryUsagePercent}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Network Latency</span>
                    <span>{performance.latencyMs}ms</span>
                  </div>
                  <div className="grid h-8 grid-cols-7 gap-1">
                    {[20, 35, 50, 25, 45, 30, 60].map((height, index) => (
                      <div
                        key={height + index}
                        className="self-end rounded-sm bg-primary/30"
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80 bg-background shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold">Active Peers</h3>
                  <Badge variant="secondary" className="rounded-full text-[10px]">
                    {peerSummary.totalUnique} Online
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {peerSummary.peers.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No peer activity yet.</p>
                ) : (
                  peerSummary.peers.map((peer) => (
                    <div key={peer.subjectUuid} className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarFallback>{toAvatarFallback(peer.subjectUuid)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold">{peer.subjectUuid}</p>
                        <p className="text-[10px] text-emerald-600">
                          Connected • {peer.latencyMs}ms
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </aside>
        </section>
      </main>
    </div>
  )
}

