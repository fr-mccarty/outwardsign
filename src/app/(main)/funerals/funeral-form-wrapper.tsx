'use client'

import React, { useState } from 'react'
import { FuneralForm } from './funeral-form'
import { PageContainer } from '@/components/page-container'
import { ModuleSaveButton } from '@/components/module-save-button'
import { ModuleViewButton } from '@/components/module-view-button'
import type { Funeral } from '@/lib/types'

interface FuneralFormWrapperProps {
  funeral?: Funeral
  title: string
  description: string
  saveButtonLabel: string
}

export function FuneralFormWrapper({
  funeral,
  title,
  description,
  saveButtonLabel
}: FuneralFormWrapperProps) {
  const formId = 'funeral-form'
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!funeral

  return (
    <PageContainer
      title={title}
      description={description}
      primaryAction={<ModuleSaveButton moduleName="Funeral" isLoading={isLoading} isEditing={isEditing} form={formId} />}
      additionalActions={isEditing ? [
        {
          type: 'action',
          label: 'View Funeral',
          href: `/funerals/${funeral.id}`
        }
      ] : undefined}
    >
      <FuneralForm
        funeral={funeral}
        formId={formId}
        onLoadingChange={setIsLoading}
      />
    </PageContainer>
  )
}
