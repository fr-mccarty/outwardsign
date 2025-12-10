'use client'

import { useEffect, useState } from 'react'
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
import { IconPicker } from '@/components/icon-picker'
import { createEventType, updateEventType } from '@/lib/actions/event-types'
import {
  createEventTypeSchema,
  type CreateEventTypeData,
} from '@/lib/schemas/event-types'
import { toast } from 'sonner'
import type { EventType } from '@/lib/types/event-types'
import { generateSlug } from '@/lib/utils/formatters'

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
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)

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
      icon: 'FileText',
      slug: '',
    },
  })

  const name = watch('name')
  const icon = watch('icon')
  const slug = watch('slug')

  // Initialize form when dialog opens or eventType changes
  useEffect(() => {
    if (open) {
      if (eventType) {
        reset({
          name: eventType.name,
          icon: eventType.icon || 'FileText',
          slug: eventType.slug || '',
        })
        setSlugManuallyEdited(false)
      } else {
        reset({
          name: '',
          icon: 'FileText',
          slug: '',
        })
        setSlugManuallyEdited(false)
      }
    }
  }, [eventType, open, reset])

  // Auto-generate slug from name (unless manually edited)
  useEffect(() => {
    if (!slugManuallyEdited && name) {
      setValue('slug', generateSlug(name))
    }
  }, [name, slugManuallyEdited, setValue])

  const onSubmit = async (data: CreateEventTypeData) => {
    try {
      if (isEditing) {
        await updateEventType(eventType.id, {
          name: data.name,
          icon: data.icon,
          slug: data.slug,
        })
        toast.success('Event type updated successfully')
      } else {
        await createEventType({
          name: data.name,
          icon: data.icon,
          slug: data.slug,
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
              placeholder="e.g., Wedding, Funeral, Baptism, etc."
            />

            <FormInput
              id="slug"
              label="Slug"
              value={slug || ''}
              onChange={(value) => {
                setValue('slug', value)
                setSlugManuallyEdited(true)
              }}
              error={errors.slug?.message}
              placeholder="e.g., weddings, funerals, baptisms, etc."
              description="URL-friendly identifier. Auto-generated from name, but you can customize it."
            />

            <IconPicker
              value={icon}
              onChange={(value) => setValue('icon', value)}
              label="Icon"
              required
              error={errors.icon?.message}
            />
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
