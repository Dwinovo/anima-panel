'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { Plus } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  SessionApiError,
  createSession,
  deleteSession,
  getSessionErrorMessage,
  listSessions,
  updateSession,
} from '@/features/sessions/services/sessionService'
import type {
  SessionCreatePayload,
  SessionFormValues,
  SessionListItem,
} from '@/features/sessions/types'

import { DeleteSessionDialog } from './DeleteSessionDialog'
import { SessionFormDialog } from './SessionFormDialog'
import { SessionsTable } from './SessionsTable'

const EMPTY_FORM_VALUES: SessionFormValues = {
  name: '',
  description: '',
  maxAgentsLimit: '1000',
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

function toFormValues(session: SessionListItem): SessionFormValues {
  return {
    name: session.name,
    description: session.description ?? '',
    maxAgentsLimit: String(session.max_agents_limit),
  }
}

function LoadingState() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  )
}

export function SessionsPageClient() {
  const [sessions, setSessions] = useState<SessionListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingSession, setEditingSession] = useState<SessionListItem | null>(null)
  const [deletingSession, setDeletingSession] = useState<SessionListItem | null>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const editInitialValues = useMemo(
    () => (editingSession ? toFormValues(editingSession) : EMPTY_FORM_VALUES),
    [editingSession],
  )

  const loadSessions = useCallback(async () => {
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
    void loadSessions()
  }, [loadSessions])

  async function handleCreate(payload: SessionCreatePayload) {
    setIsSubmitting(true)

    try {
      await createSession(payload)
      toast.success('Session created.')
      setIsCreateOpen(false)
      await loadSessions()
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
      await loadSessions()
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
      await loadSessions()
    } catch (error) {
      const message = resolveErrorMessage(error)
      toast.error(message)
      throw new Error(message)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-8 md:px-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Session Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage Session resources and inspect control-plane records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="secondary">Total: {sessions.length}</Badge>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="size-4" />
            Create Session
          </Button>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Sessions</CardTitle>
          <CardDescription>
            Fields follow API contract: <code>session_id</code>, <code>name</code>,{' '}
            <code>description</code>, and <code>max_agents_limit</code>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? <LoadingState /> : null}

          {!isLoading && loadError ? (
            <div className="flex flex-col items-start gap-4 rounded-md border border-destructive/30 bg-destructive/5 p-4">
              <p className="text-sm text-destructive">{loadError}</p>
              <Button variant="outline" onClick={() => void loadSessions()}>
                Retry
              </Button>
            </div>
          ) : null}

          {!isLoading && !loadError && sessions.length === 0 ? (
            <div className="rounded-md border border-dashed p-10 text-center">
              <p className="text-sm text-muted-foreground">
                No session found. Create your first session to start.
              </p>
            </div>
          ) : null}

          {!isLoading && !loadError && sessions.length > 0 ? (
            <SessionsTable
              sessions={sessions}
              onEdit={setEditingSession}
              onDelete={setDeletingSession}
            />
          ) : null}
        </CardContent>
      </Card>

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
    </main>
  )
}
