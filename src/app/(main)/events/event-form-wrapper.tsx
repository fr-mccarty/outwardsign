'use client'

import React, { useState } from 'react'
import { EventForm } from './event-form'
import { PageContainer } from '@/components/page-container'
import { ModuleSaveButton } from '@/components/module-save-button'
import { ModuleViewButton } from '@/components/module-view-button'
import type { EventWithRelations } from '@/lib/actions/events'

interface EventFormWrapperProps {
  event?: EventWithRelations
  title: string
  description: string
  saveButtonLabel: string
}

export function EventFormWrapper({
  event,
  title,
  description,
  saveButtonLabel
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
          href: `/events/${event.id}`
        }
      ] : undefined}
    >
      <EventForm
        event={event}
        formId={formId}
        onLoadingChange={setIsLoading}
      />
    </PageContainer>
  )
}
