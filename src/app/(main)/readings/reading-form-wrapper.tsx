'use client'

import React, { useState } from 'react'
import { ReadingForm } from './reading-form'
import { PageContainer } from '@/components/page-container'
import { ModuleSaveButton } from '@/components/module-save-button'
import { ModuleViewButton } from '@/components/module-view-button'
import type { Reading } from '@/lib/actions/readings'

interface ReadingFormWrapperProps {
  reading?: Reading
  title: string
  description: string
  saveButtonLabel: string
}

export function ReadingFormWrapper({
  reading,
  title,
  description,
  saveButtonLabel
}: ReadingFormWrapperProps) {
  const formId = 'reading-form'
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!reading

  const actions = (
    <>
      {isEditing && (
        <ModuleViewButton moduleName="Reading" href={`/readings/${reading.id}`} />
      )}
      <ModuleSaveButton moduleName="Reading" isLoading={isLoading} isEditing={isEditing} form={formId} />
    </>
  )

  return (
    <PageContainer
      title={title}
      description={description}
      actions={actions}
    >
      <ReadingForm
        reading={reading}
        formId={formId}
        onLoadingChange={setIsLoading}
      />
    </PageContainer>
  )
}
