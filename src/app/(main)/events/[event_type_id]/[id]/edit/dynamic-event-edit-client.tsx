'use client'

import React, { useState } from 'react'
import { DynamicEventForm } from '../../dynamic-event-form'
import { PageContainer } from '@/components/page-container'
import { ModuleSaveButton } from '@/components/module-save-button'
import type { DynamicEventTypeWithRelations, DynamicEventWithRelations } from '@/lib/types'

interface DynamicEventEditClientProps {
  event: DynamicEventWithRelations
  eventType: DynamicEventTypeWithRelations
  title: string
  description: string
}

export function DynamicEventEditClient({
  event,
  eventType,
  title,
  description
}: DynamicEventEditClientProps) {
  const formId = 'dynamic-event-form'
  const [isLoading, setIsLoading] = useState(false)

  return (
    <PageContainer
      title={title}
      description={description}
      primaryAction={<ModuleSaveButton moduleName={eventType.name} isLoading={isLoading} isEditing={true} form={formId} />}
      additionalActions={[
        {
          type: 'action',
          label: `View ${eventType.name}`,
          href: `/events/${eventType.id}/${event.id}`
        }
      ]}
    >
      <DynamicEventForm
        event={event}
        eventType={eventType}
        formId={formId}
        onLoadingChange={setIsLoading}
      />
    </PageContainer>
  )
}
