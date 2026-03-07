import { Eye, PencilLine, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'

import type { SessionListItem } from '../types'

type SessionsDataTableProps = {
  sessions: SessionListItem[]
  onView: (session: SessionListItem) => void
  onEdit: (session: SessionListItem) => void
  onDelete: (session: SessionListItem) => void
}

type SessionVisualState = {
  label: string
  dotClassName: string
}

function resolveSessionVisualState(sessionId: string): SessionVisualState {
  const hash = Array.from(sessionId).reduce((sum, char) => sum + char.charCodeAt(0), 0)
  const index = hash % 3

  if (index === 0) {
    return { label: 'Healthy', dotClassName: 'bg-emerald-500' }
  }

  if (index === 1) {
    return { label: 'Watch', dotClassName: 'bg-amber-500' }
  }

  return { label: 'Low', dotClassName: 'bg-slate-400' }
}

export function SessionsDataTable({
  sessions,
  onView,
  onEdit,
  onDelete,
}: SessionsDataTableProps) {
  const maxCapacity = sessions.reduce((max, session) => {
    return Math.max(max, session.max_agents_limit)
  }, 0)

  return (
    <section className="overflow-hidden rounded-xl border border-border/80 bg-background/95 shadow-sm">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow className="hover:bg-muted/40">
            <TableHead className="h-12 px-6 text-xs uppercase tracking-wide text-muted-foreground">
              Session ID
            </TableHead>
            <TableHead className="h-12 px-6 text-xs uppercase tracking-wide text-muted-foreground">
              Name
            </TableHead>
            <TableHead className="h-12 px-6 text-xs uppercase tracking-wide text-muted-foreground">
              Description
            </TableHead>
            <TableHead className="h-12 px-6 text-xs uppercase tracking-wide text-muted-foreground">
              Max Agents
            </TableHead>
            <TableHead className="h-12 px-6 text-right text-xs uppercase tracking-wide text-muted-foreground">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {sessions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="px-6 py-12 text-center text-sm text-muted-foreground">
                No session matched your query.
              </TableCell>
            </TableRow>
          ) : (
            sessions.map((session) => {
              const sessionState = resolveSessionVisualState(session.session_id)
              const ratio = maxCapacity === 0 ? 0 : session.max_agents_limit / maxCapacity

              return (
                <TableRow key={session.session_id} className="border-border/70">
                  <TableCell className="px-6 py-4">
                    <span className="rounded bg-muted px-2 py-1 font-mono text-xs text-muted-foreground">
                      {session.session_id}
                    </span>
                  </TableCell>

                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={cn('size-2 rounded-full', sessionState.dotClassName)} />
                      <span className="text-sm font-semibold">{session.name}</span>
                    </div>
                    <p className="pt-1 text-xs text-muted-foreground">{sessionState.label}</p>
                  </TableCell>

                  <TableCell className="max-w-md px-6 py-4 text-sm text-muted-foreground">
                    <p className="truncate">{session.description ?? '-'}</p>
                  </TableCell>

                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="w-12 text-sm font-medium">{session.max_agents_limit}</span>
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${Math.max(8, Math.round(ratio * 100))}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        aria-label={`View ${session.name}`}
                        onClick={() => onView(session)}
                      >
                        <Eye className="size-4" />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        aria-label={`Edit ${session.name}`}
                        onClick={() => onEdit(session)}
                      >
                        <PencilLine className="size-4" />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        aria-label={`Delete ${session.name}`}
                        onClick={() => onDelete(session)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between border-t border-border/70 bg-muted/30 px-6 py-3 text-xs text-muted-foreground">
        <span>Showing 1 to {sessions.length} sessions</span>
        <span>Pagination is reserved for backend cursor support.</span>
      </div>
    </section>
  )
}

