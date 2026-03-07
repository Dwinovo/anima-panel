'use client'

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

import {
  SessionApiError,
  createSession,
  deleteSession,
  getSessionErrorMessage,
  listSessions,
  updateSession,
} from '../services/sessionService'
import type {
  SessionCreatePayload,
  SessionFormValues,
  SessionListItem,
} from '../types'
import { DeleteSessionDialog } from './DeleteSessionDialog'
import { SessionFormDialog } from './SessionFormDialog'
import { SessionStatsCards } from './SessionStatsCards'
import { SessionsDataTable } from './SessionsDataTable'
import { SessionsLayoutChrome } from './SessionsLayoutChrome'
import { buildSessionsStats, filterSessionsByQuery } from './sessionPageViewModel'

const EMPTY_FORM_VALUES: SessionFormValues = {
  name: '',
  description: '',
  maxAgentsLimit: '1000',
}

function toFormValues(session: SessionListItem): SessionFormValues {
  return {
    name: session.name,
    description: session.description ?? '',
    maxAgentsLimit: String(session.max_agents_limit),
  }
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

function LoadingBlock() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-72 w-full rounded-xl" />
    </div>
  )
}

export function SessionsPageClient() {
  const router = useRouter()

  const [sessions, setSessions] = useState<SessionListItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingSession, setEditingSession] = useState<SessionListItem | null>(null)
  const [deletingSession, setDeletingSession] = useState<SessionListItem | null>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const deferredQuery = useDeferredValue(searchQuery)

  const filteredSessions = useMemo(() => {
    return filterSessionsByQuery(sessions, deferredQuery)
  }, [sessions, deferredQuery])

  const stats = useMemo(() => {
    return buildSessionsStats(filteredSessions)
  }, [filteredSessions])

  const editInitialValues = useMemo(() => {
    return editingSession ? toFormValues(editingSession) : EMPTY_FORM_VALUES
  }, [editingSession])

  const loadSessionList = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)

    try {
      const items = await listSessions()
      setSessions(items)
    } catch (error) {
      setLoadError(resolveErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadSessionList()
  }, [loadSessionList])

  async function handleCreate(payload: SessionCreatePayload) {
    setIsSubmitting(true)

    try {
      await createSession(payload)
      toast.success('Session created.')
      setIsCreateOpen(false)
      await loadSessionList()
    } catch (error) {
      const message = resolveErrorMessage(error)
      toast.error(message)
      throw new Error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleEdit(payload: SessionCreatePayload) {
    if (!editingSession) {
      return
    }

    setIsSubmitting(true)

    try {
      await updateSession(editingSession.session_id, payload)
      toast.success('Session updated.')
      setEditingSession(null)
      await loadSessionList()
    } catch (error) {
      const message = resolveErrorMessage(error)
      toast.error(message)
      throw new Error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!deletingSession) {
      return
    }

    setIsDeleting(true)

    try {
      await deleteSession(deletingSession.session_id)
      toast.success('Session deleted.')
      setDeletingSession(null)
      await loadSessionList()
    } catch (error) {
      const message = resolveErrorMessage(error)
      toast.error(message)
      throw new Error(message)
    } finally {
      setIsDeleting(false)
    }
  }

  function handleView(session: SessionListItem) {
    router.push(`/sessions/${session.session_id}`)
  }

  return (
    <SessionsLayoutChrome
      totalSessions={sessions.length}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onCreateSession={() => setIsCreateOpen(true)}
    >
      <SessionStatsCards
        activeSessions={stats.activeSessions}
        totalCapacity={stats.totalCapacity}
        averageCapacity={stats.averageCapacity}
      />

      {isLoading ? <LoadingBlock /> : null}

      {!isLoading && loadError ? (
        <section className="rounded-xl border border-destructive/40 bg-destructive/5 p-5">
          <p className="text-sm text-destructive">{loadError}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              void loadSessionList()
            }}
          >
            Retry
          </Button>
        </section>
      ) : null}

      {!isLoading && !loadError ? (
        <SessionsDataTable
          sessions={filteredSessions}
          onView={handleView}
          onEdit={setEditingSession}
          onDelete={setDeletingSession}
        />
      ) : null}

      <SessionFormDialog
        key={isCreateOpen ? 'create-open' : 'create-closed'}
        mode="create"
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        initialValues={EMPTY_FORM_VALUES}
        isSubmitting={isSubmitting}
        onSubmit={handleCreate}
      />

      <SessionFormDialog
        key={editingSession?.session_id ?? 'edit-closed'}
        mode="edit"
        open={editingSession !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingSession(null)
          }
        }}
        initialValues={editInitialValues}
        isSubmitting={isSubmitting}
        onSubmit={handleEdit}
      />

      <DeleteSessionDialog
        open={deletingSession !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingSession(null)
          }
        }}
        sessionName={deletingSession?.name ?? '-'}
        isDeleting={isDeleting}
        onConfirm={handleDelete}
      />
    </SessionsLayoutChrome>
  )
}
