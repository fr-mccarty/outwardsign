'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PageContainer } from '@/components/page-container'
import { ContentCard } from '@/components/content-card'
import { Button } from '@/components/ui/button'
import { FormInput } from '@/components/form-input'
import { Label } from '@/components/ui/label'
import { createEventType } from '@/lib/actions/event-types'
import {
  createEventTypeSchema,
  type CreateEventTypeData,
} from '@/lib/schemas/event-types'
import { toast } from 'sonner'
import { IconSelector } from '@/components/icon-selector'

export function EventTypeCreateClient() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateEventTypeData>({
    resolver: zodResolver(createEventTypeSchema),
    defaultValues: {
      name: '',
      icon: 'Calendar',
    },
  })

  const name = watch('name')
  const icon = watch('icon')

  const onSubmit = async (data: CreateEventTypeData) => {
    setIsSubmitting(true)
    try {
      const eventType = await createEventType({
        name: data.name,
        icon: data.icon,
      })
      toast.success('Event type created successfully')
      router.push(`/settings/event-types/${eventType.slug}`)
    } catch (error) {
      console.error('Failed to create event type:', error)
      toast.error('Failed to create event type')
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push('/settings/event-types')
  }

  return (
    <PageContainer
      title="Create Event Type"
      description="Add a new event type for your parish"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <ContentCard>
          <div className="space-y-4">
            <FormInput
              id="name"
              label="Name"
              value={name}
              onChange={(value) => setValue('name', value)}
              error={errors.name?.message}
              required
              placeholder="e.g., Wedding, Funeral, Baptism..."
            />

            <div className="space-y-2">
              <Label htmlFor="icon">Icon</Label>
              <IconSelector
                value={icon}
                onChange={(value) => setValue('icon', value)}
              />
              {errors.icon && (
                <p className="text-sm text-destructive">{errors.icon.message}</p>
              )}
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Event Type'}
            </Button>
          </div>
        </ContentCard>
      </form>
    </PageContainer>
  )
}
