'use client'

import React, { useState } from 'react'
import { MasterEventForm } from '../master-event-form'
import { PageContainer } from '@/components/page-container'
import { ModuleSaveButton } from '@/components/module-save-button'
import type { EventTypeWithRelations } from '@/lib/types'

interface DynamicEventCreateClientProps {
  eventType: EventTypeWithRelations
  title: string
  description: string
}

export function DynamicEventCreateClient({
  eventType,
  title,
  description
}: DynamicEventCreateClientProps) {
  const formId = 'dynamic-event-form'
  const [isLoading, setIsLoading] = useState(false)

  return (
    <PageContainer
      title={title}
      description={description}
      primaryAction={<ModuleSaveButton moduleName={eventType.name} isLoading={isLoading} isEditing={false} form={formId} />}
    >
      <MasterEventForm
        eventType={eventType}
        formId={formId}
        onLoadingChange={setIsLoading}
      />
    </PageContainer>
  )
}
