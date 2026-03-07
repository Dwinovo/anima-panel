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
} from '../services/sessionValidation'
import type {
  SessionCreatePayload,
  SessionFormValues,
  SessionValidationErrors,
} from '../types'

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
  const [values, setValues] = useState<SessionFormValues>(initialValues)
  const [fieldErrors, setFieldErrors] = useState<SessionValidationErrors>({})
  const [formError, setFormError] = useState<string | null>(null)

  const title = useMemo(() => {
    return mode === 'create' ? 'Create Session' : 'Edit Session'
  }, [mode])

  const submitLabel = mode === 'create' ? 'Create' : 'Save Changes'

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
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Configure core session fields for the control plane.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor={`${mode}-session-name`}>Session Name</Label>
            <Input
              id={`${mode}-session-name`}
              value={values.name}
              onChange={(event) =>
                setValues((current) => ({ ...current, name: event.target.value }))
              }
              placeholder="Alpha Production"
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
              rows={4}
              value={values.description}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              placeholder="Optional description"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${mode}-session-limit`}>Max Agents Limit</Label>
            <Input
              id={`${mode}-session-limit`}
              type="number"
              min={1}
              step={1}
              value={values.maxAgentsLimit}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  maxAgentsLimit: event.target.value,
                }))
              }
              disabled={isSubmitting}
            />
            {fieldErrors.max_agents_limit ? (
              <p className="text-sm text-destructive">{fieldErrors.max_agents_limit}</p>
            ) : null}
          </div>

          {formError ? <p className="text-sm text-destructive">{formError}</p> : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
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
