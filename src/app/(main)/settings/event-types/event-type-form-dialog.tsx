'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FormInput } from '@/components/form-input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { createEventType, updateEventType } from '@/lib/actions/event-types'
import { toast } from 'sonner'
import type { EventType } from '@/lib/types'

interface EventTypeFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventType?: EventType
  onSuccess: () => void
}

export function EventTypeFormDialog({
  open,
  onOpenChange,
  eventType,
  onSuccess,
}: EventTypeFormDialogProps) {
  const isEditing = !!eventType
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isActive, setIsActive] = useState(true)

  // Initialize form when eventType changes
  useEffect(() => {
    if (eventType) {
      setName(eventType.name)
      setDescription(eventType.description || '')
      setIsActive(eventType.is_active)
    } else {
      setName('')
      setDescription('')
      setIsActive(true)
    }
  }, [eventType])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (isEditing) {
        await updateEventType(eventType.id, {
          name,
          description: description || undefined,
          is_active: isActive,
        })
        toast.success('Event type updated successfully')
      } else {
        await createEventType({
          name,
          description: description || undefined,
          is_active: isActive,
        })
        toast.success('Event type created successfully')
      }
      onSuccess()
    } catch (error) {
      console.error('Failed to save event type:', error)
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} event type`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Event Type' : 'Create Event Type'}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Update the event type details below.'
                : 'Add a new event type for your parish.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <FormInput
              id="name"
              label="Name"
              value={name}
              onChange={setName}
              required
              placeholder="e.g., Parish Meeting, Fundraiser, etc."
            />

            <FormInput
              id="description"
              label="Description"
              inputType="textarea"
              value={description}
              onChange={setDescription}
              placeholder="Optional description of this event type..."
              rows={3}
            />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is-active">Active</Label>
                <div className="text-sm text-muted-foreground">
                  Inactive types will not appear in event creation forms
                </div>
              </div>
              <Switch
                id="is-active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
