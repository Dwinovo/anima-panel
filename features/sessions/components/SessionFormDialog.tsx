'use client'

import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  normalizeSessionPayload,
  validateSessionPayload,
} from '@/features/sessions/services/sessionValidation'
import type { SessionCreatePayload, SessionFormValues } from '@/features/sessions/types'

type SessionFormDialogProps = {
  mode: 'create' | 'edit'
  open: boolean
  onOpenChange: (open: boolean) => void
  initialValues: SessionFormValues
  isSubmitting: boolean
  onSubmit: (payload: SessionCreatePayload) => Promise<void>
}

export function SessionFormDialog({
  mode,
  open,
  onOpenChange,
  initialValues,
  isSubmitting,
  onSubmit,
}: SessionFormDialogProps) {
  const [values, setValues] = useState<SessionFormValues>(() => initialValues)
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string
    max_agents_limit?: string
  }>({})

  const title = useMemo(
    () => (mode === 'create' ? 'Create Session' : 'Edit Session'),
    [mode],
  )

  const submitLabel = mode === 'create' ? 'Create' : 'Save changes'

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    const payload = normalizeSessionPayload(values)
    const validation = validateSessionPayload(payload)

    if (!validation.isValid) {
      setFieldErrors(validation.errors)
      return
    }

    setFieldErrors({})

    try {
      await onSubmit(payload)
    } catch (error) {
      if (error instanceof Error && error.message.trim().length > 0) {
        setFormError(error.message)
      } else {
        setFormError('Request failed. Please retry.')
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Configure the Session control-plane settings.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`${mode}-session-name`}>Name</Label>
            <Input
              id={`${mode}-session-name`}
              value={values.name}
              onChange={(event) =>
                setValues((current) => ({ ...current, name: event.target.value }))
              }
              placeholder="Demo social world"
              disabled={isSubmitting}
            />
            {fieldErrors.name ? (
              <p className="text-sm text-destructive">{fieldErrors.name}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${mode}-session-description`}>Description</Label>
            <Textarea
              id={`${mode}-session-description`}
              value={values.description}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              placeholder="Optional description"
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${mode}-max-agents`}>Max agents limit</Label>
            <Input
              id={`${mode}-max-agents`}
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              value={values.maxAgentsLimit}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  maxAgentsLimit: event.target.value,
                }))
              }
              placeholder="1000"
              disabled={isSubmitting}
            />
            {fieldErrors.max_agents_limit ? (
              <p className="text-sm text-destructive">
                {fieldErrors.max_agents_limit}
              </p>
            ) : null}
          </div>

          {formError ? <p className="text-sm text-destructive">{formError}</p> : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
