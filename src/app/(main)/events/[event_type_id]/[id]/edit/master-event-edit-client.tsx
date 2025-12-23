'use client'

import React, { useState } from 'react'
import { MasterEventForm } from '../../master-event-form'
import { PageContainer } from '@/components/page-container'
import { SaveButton } from '@/components/save-button'
import { Eye, Settings } from 'lucide-react'
import type { EventTypeWithRelations, DynamicEventWithRelations } from '@/lib/types'

interface DynamicEventEditClientProps {
  event: DynamicEventWithRelations
  eventType: EventTypeWithRelations
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
      primaryAction={<SaveButton moduleName={eventType.name} isLoading={isLoading} isEditing={true} form={formId} />}
      additionalActions={[
        {
          type: 'action',
          label: `View ${eventType.name}`,
          icon: <Eye className="h-4 w-4" />,
          href: `/events/${eventType.slug}/${event.id}`
        },
        {
          type: 'action',
          label: 'Configure Input Fields',
          icon: <Settings className="h-4 w-4" />,
          href: `/settings/event-types/${eventType.slug}/fields`
        }
      ]}
    >
      <MasterEventForm
        event={event}
        eventType={eventType}
        formId={formId}
        onLoadingChange={setIsLoading}
      />
    </PageContainer>
  )
}
