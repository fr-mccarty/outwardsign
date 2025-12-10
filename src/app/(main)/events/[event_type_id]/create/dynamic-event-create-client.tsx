'use client'

import React, { useState } from 'react'
import { DynamicEventForm } from '../dynamic-event-form'
import { PageContainer } from '@/components/page-container'
import { ModuleSaveButton } from '@/components/module-save-button'
import type { DynamicEventTypeWithRelations } from '@/lib/types'

interface DynamicEventCreateClientProps {
  eventType: DynamicEventTypeWithRelations
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
      <DynamicEventForm
        eventType={eventType}
        formId={formId}
        onLoadingChange={setIsLoading}
      />
    </PageContainer>
  )
}
