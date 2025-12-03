'use client'

import React, { useState } from 'react'
import { ReadingForm } from './reading-form'
import { PageContainer } from '@/components/page-container'
import { ModuleSaveButton } from '@/components/module-save-button'
import type { Reading } from '@/lib/actions/readings'

interface ReadingFormWrapperProps {
  reading?: Reading
  title: string
  description: string
}

export function ReadingFormWrapper({
  reading,
  title,
  description
}: ReadingFormWrapperProps) {
  const formId = 'reading-form'
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!reading

  return (
    <PageContainer
      title={title}
      description={description}
      primaryAction={<ModuleSaveButton moduleName="Reading" isLoading={isLoading} isEditing={isEditing} form={formId} />}
      additionalActions={isEditing ? [
        {
          type: 'action',
          label: 'View Reading',
          href: `/readings/${reading.id}`
        }
      ] : undefined}
    >
      <ReadingForm
        reading={reading}
        formId={formId}
        onLoadingChange={setIsLoading}
      />
    </PageContainer>
  )
}
