'use client'

import React, { useState } from 'react'
import { EventForm } from './event-form'
import { PageContainer } from '@/components/page-container'
import { ModuleSaveButton } from '@/components/module-save-button'
import type { EventWithRelations } from '@/lib/actions/events'

interface EventFormWrapperProps {
  event?: EventWithRelations
  title: string
  description: string
  /** When true, only show minimal fields (name, description, event type) - used for create mode */
  minimalMode?: boolean
  /** Pre-fill event type ID from URL query parameter */
  prefilledEventTypeId?: string
}

export function EventFormWrapper({
  event,
  title,
  description,
  minimalMode = false,
  prefilledEventTypeId
}: EventFormWrapperProps) {
  const formId = 'event-form'
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!event

  return (
    <PageContainer
      title={title}
      description={description}
      primaryAction={<ModuleSaveButton moduleName="Event" isLoading={isLoading} isEditing={isEditing} form={formId} />}
      additionalActions={isEditing ? [
        {
          type: 'action',
          label: 'View Event',
          href: `/events/${event.event_type_id}/${event.id}`
        }
      ] : undefined}
    >
      <EventForm
        event={event}
        formId={formId}
        onLoadingChange={setIsLoading}
        minimalMode={minimalMode}
        prefilledEventTypeId={prefilledEventTypeId}
      />
    </PageContainer>
  )
}
