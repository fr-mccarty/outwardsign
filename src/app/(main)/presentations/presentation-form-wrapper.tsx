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
  saveButtonLabel: string
}

export function PresentationFormWrapper({
  presentation,
  title,
  description,
  saveButtonLabel
}: PresentationFormWrapperProps) {
  const formId = 'presentation-form'
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!presentation

  const actions = (
    <>
      {isEditing && (
        <ModuleViewButton moduleName="Presentation" href={`/presentations/${presentation.id}`} />
      )}
      <ModuleSaveButton moduleName="Presentation" isLoading={isLoading} isEditing={isEditing} form={formId} />
    </>
  )

  return (
    <PageContainer
      title={title}
      description={description}
      actions={actions}
    >
      <PresentationForm
        presentation={presentation}
        formId={formId}
        onLoadingChange={setIsLoading}
      />
    </PageContainer>
  )
}
