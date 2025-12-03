'use client'

import React, { useState } from 'react'
import { PresentationForm } from './presentation-form'
import { PageContainer } from '@/components/page-container'
import { ModuleSaveButton } from '@/components/module-save-button'
import { ModuleViewButton } from '@/components/module-view-button'
import type { PresentationWithRelations } from '@/lib/actions/presentations'

interface PresentationFormWrapperProps {
  presentation?: PresentationWithRelations
  title: string
  description: string
}

export function PresentationFormWrapper({
  presentation,
  title,
  description
}: PresentationFormWrapperProps) {
  const formId = 'presentation-form'
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!presentation

  return (
    <PageContainer
      title={title}
      description={description}
      primaryAction={<ModuleSaveButton moduleName="Presentation" isLoading={isLoading} isEditing={isEditing} form={formId} />}
      additionalActions={isEditing ? [
        {
          type: 'action',
          label: 'View Presentation',
          href: `/presentations/${presentation.id}`
        }
      ] : undefined}
    >
      <PresentationForm
        presentation={presentation}
        formId={formId}
        onLoadingChange={setIsLoading}
      />
    </PageContainer>
  )
}
