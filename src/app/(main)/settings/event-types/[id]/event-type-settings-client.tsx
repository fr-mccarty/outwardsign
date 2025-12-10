'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PageContainer } from '@/components/page-container'
import { FormSectionCard } from '@/components/form-section-card'
import { FormInput } from '@/components/form-input'
import { IconSelector } from '@/components/icon-selector'
import { SaveButton } from '@/components/save-button'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { updateEventType, deleteEventType } from '@/lib/actions/event-types'
import {
  updateEventTypeSchema,
  type UpdateEventTypeData,
} from '@/lib/schemas/event-types'
import { toast } from 'sonner'
import type { DynamicEventType } from '@/lib/types'
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog'

interface EventTypeSettingsClientProps {
  eventType: DynamicEventType
}

export function EventTypeSettingsClient({
  eventType,
}: EventTypeSettingsClientProps) {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<UpdateEventTypeData>({
    resolver: zodResolver(updateEventTypeSchema),
    defaultValues: {
      name: eventType.name,
      icon: eventType.icon,
    },
  })

  const name = watch('name')
  const icon = watch('icon')

  const onSubmit = async (data: UpdateEventTypeData) => {
    try {
      await updateEventType(eventType.id, data)
      toast.success('Event type updated successfully')
      router.refresh()
    } catch (error) {
      console.error('Failed to update event type:', error)
      toast.error('Failed to update event type')
    }
  }

  const handleDelete = async () => {
    try {
      await deleteEventType(eventType.id)
      toast.success('Event type deleted successfully')
      router.push('/settings/event-types')
    } catch (error) {
      console.error('Failed to delete event type:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete event type'
      toast.error(errorMessage)
      throw error
    }
  }

  return (
    <PageContainer
      title={eventType.name}
      description="Update event type settings."
    >
      <div className="mb-6 flex gap-2">
        <Button
          variant="outline"
          onClick={() => router.push(`/settings/event-types/${eventType.id}/fields`)}
        >
          Manage Input Fields
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push(`/settings/event-types/${eventType.id}/scripts`)}
        >
          Manage Scripts
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormSectionCard title="Basic Information">
          <div className="space-y-4">
            <FormInput
              id="name"
              label="Name"
              value={name || ''}
              onChange={(value) => setValue('name', value)}
              error={errors.name?.message}
              required
              placeholder="e.g., Wedding, Funeral, Baptism"
            />

            <IconSelector
              value={icon || 'Heart'}
              onChange={(value) => setValue('icon', value)}
              label="Icon"
              required
            />
          </div>
        </FormSectionCard>

        <div className="flex justify-between items-center">
          <Button
            type="button"
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Event Type
          </Button>

          <SaveButton isLoading={isSubmitting} />
        </div>
      </form>

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Event Type"
        description={`Are you sure you want to delete "${eventType.name}"? This will also delete all associated input fields and scripts. Events using this type will no longer have an assigned type. This action cannot be undone.`}
      />
    </PageContainer>
  )
}
