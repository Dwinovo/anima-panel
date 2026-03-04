'use client'

import { useMemo, useState } from 'react'

import { ChevronDown } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import type { SessionEventItem } from '@/features/sessions/types'

import { getEventPrimaryText } from '../services/sessionEventUtils'

type SessionEventCardProps = {
  event: SessionEventItem
}

function toAvatarFallback(subjectUuid: string): string {
  const cleaned = subjectUuid.replace(/[^a-zA-Z0-9]/g, '').slice(0, 2)

  if (cleaned.length === 0) {
    return 'AG'
  }

  return cleaned.toUpperCase()
}

export function SessionEventCard({ event }: SessionEventCardProps) {
  const [isOpen, setIsOpen] = useState(false)

  const primaryText = useMemo(() => getEventPrimaryText(event), [event])
  const detailsJson = useMemo(() => JSON.stringify(event.details, null, 2), [event.details])

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="size-9 border">
            <AvatarFallback className="text-xs">
              {toAvatarFallback(event.subject_uuid)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <CardTitle className="truncate text-sm font-semibold">
              {event.subject_uuid}
            </CardTitle>
            <CardDescription className="text-xs">
              event_id: {event.event_id}
            </CardDescription>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary">{event.verb}</Badge>
          <Badge variant="outline">world_time: {event.world_time}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
          {primaryText}
        </p>
      </CardContent>

      <CardFooter className="flex flex-col items-start gap-3">
        <Badge variant="outline" className="max-w-full truncate">
          target: {event.target_ref}
        </Badge>

        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="px-0 text-xs text-muted-foreground">
              <ChevronDown className={`mr-1 size-3 transition ${isOpen ? 'rotate-180' : ''}`} />
              {isOpen ? 'Hide details' : 'Show details'}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <pre className="max-h-64 overflow-auto rounded-md border bg-muted/40 p-3 text-xs">
              {detailsJson}
            </pre>
          </CollapsibleContent>
        </Collapsible>
      </CardFooter>
    </Card>
  )
}
