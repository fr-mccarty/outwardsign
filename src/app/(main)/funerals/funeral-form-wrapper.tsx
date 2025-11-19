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

  const actions = (
    <>
      {isEditing && (
        <ModuleViewButton moduleName="Funeral" href={`/funerals/${funeral.id}`} />
      )}
      <ModuleSaveButton moduleName="Funeral" isLoading={isLoading} isEditing={isEditing} form={formId} />
    </>
  )

  return (
    <PageContainer
      title={title}
      description={description}
      actions={actions}
    >
      <FuneralForm
        funeral={funeral}
        formId={formId}
        onLoadingChange={setIsLoading}
      />
    </PageContainer>
  )
}
