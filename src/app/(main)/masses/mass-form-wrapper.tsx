'use client'

import React, { useState } from 'react'
import { MassForm } from './mass-form'
import { PageContainer } from '@/components/page-container'
import { SaveButton } from '@/components/save-button'
import type { MassWithRelations } from '@/lib/schemas/masses'
import type { GlobalLiturgicalEvent } from '@/lib/actions/global-liturgical-events'

interface MassFormWrapperProps {
  mass?: MassWithRelations
  title: string
  description: string
  initialLiturgicalEvent?: GlobalLiturgicalEvent | null
}

export function MassFormWrapper({
  mass,
  title,
  description,
  initialLiturgicalEvent
}: MassFormWrapperProps) {
  const formId = 'mass-form'
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!mass

  return (
    <PageContainer
      title={title}
      description={description}
      primaryAction={<SaveButton moduleName="Mass" isLoading={isLoading} isEditing={isEditing} form={formId} />}
      additionalActions={isEditing ? [
        {
          type: 'action',
          label: 'View Mass',
          href: `/masses/${mass.id}`
        }
      ] : undefined}
    >
      <MassForm
        mass={mass}
        formId={formId}
        onLoadingChange={setIsLoading}
        initialLiturgicalEvent={initialLiturgicalEvent}
      />
    </PageContainer>
  )
}
