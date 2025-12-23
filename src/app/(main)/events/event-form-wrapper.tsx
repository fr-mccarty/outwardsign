'use client'

import React, { useState } from 'react'
import { EventForm } from './event-form'
import { PageContainer } from '@/components/page-container'
import { SaveButton } from '@/components/save-button'
import type { MasterEventWithRelations } from '@/lib/types'
import type { LiturgicalCalendarEvent } from '@/lib/actions/liturgical-calendar'

interface EventFormWrapperProps {
  event?: MasterEventWithRelations
  title: string
  description: string
  initialLiturgicalEvent?: LiturgicalCalendarEvent | null
}

export function EventFormWrapper({
  event,
  title,
  description,
  initialLiturgicalEvent
}: EventFormWrapperProps) {
  const formId = 'event-form'
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!event

  return (
    <PageContainer
      title={title}
      description={description}
      primaryAction={<SaveButton moduleName="Event" isLoading={isLoading} isEditing={isEditing} form={formId} />}
      additionalActions={isEditing ? [
        {
          type: 'action',
          label: 'View Event',
          href: `/events/${event.id}`
        }
      ] : undefined}
    >
      <EventForm
        event={event}
        formId={formId}
        onLoadingChange={setIsLoading}
        initialLiturgicalEvent={initialLiturgicalEvent}
      />
    </PageContainer>
  )
}
