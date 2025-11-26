'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import {
  createEventTypeSchema,
  type CreateEventTypeData,
} from '@/lib/schemas/event-types'
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

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<CreateEventTypeData>({
    resolver: zodResolver(createEventTypeSchema),
    defaultValues: {
      name: '',
      description: '',
      is_active: true,
    },
  })

  const name = watch('name')
  const description = watch('description')
  const isActive = watch('is_active')

  // Initialize form when dialog opens or eventType changes
  useEffect(() => {
    if (open) {
      if (eventType) {
        reset({
          name: eventType.name,
          description: eventType.description || '',
          is_active: eventType.is_active,
        })
      } else {
        reset({
          name: '',
          description: '',
          is_active: true,
        })
      }
    }
  }, [eventType, open, reset])

  const onSubmit = async (data: CreateEventTypeData) => {
    try {
      if (isEditing) {
        await updateEventType(eventType.id, {
          name: data.name,
          description: data.description || undefined,
          is_active: data.is_active,
        })
        toast.success('Event type updated successfully')
      } else {
        await createEventType({
          name: data.name,
          description: data.description || undefined,
          is_active: data.is_active,
        })
        toast.success('Event type created successfully')
      }
      onSuccess()
    } catch (error) {
      console.error('Failed to save event type:', error)
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} event type`)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit(onSubmit)}>
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
              onChange={(value) => setValue('name', value)}
              error={errors.name?.message}
              required
              placeholder="e.g., Parish Meeting, Fundraiser, etc."
            />

            <FormInput
              id="description"
              label="Description"
              inputType="textarea"
              value={description || ''}
              onChange={(value) => setValue('description', value)}
              error={errors.description?.message}
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
                checked={isActive ?? true}
                onCheckedChange={(checked) => setValue('is_active', checked)}
              />
            </div>
          </div>

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
              {isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
