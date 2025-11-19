'use client'

import React, { useState } from 'react'
import { WeddingForm } from './wedding-form'
import { PageContainer } from '@/components/page-container'
import { ModuleSaveButton } from '@/components/module-save-button'
import { ModuleViewButton } from '@/components/module-view-button'
import type { Wedding } from '@/lib/types'

interface WeddingFormWrapperProps {
  wedding?: Wedding
  title: string
  description: string
  saveButtonLabel: string
}

export function WeddingFormWrapper({
  wedding,
  title,
  description,
  saveButtonLabel
}: WeddingFormWrapperProps) {
  const formId = 'wedding-form'
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!wedding

  const actions = (
    <>
      {isEditing && (
        <ModuleViewButton moduleName="Wedding" href={`/weddings/${wedding.id}`} />
      )}
      <ModuleSaveButton moduleName="Wedding" isLoading={isLoading} isEditing={isEditing} form={formId} />
    </>
  )

  return (
    <PageContainer
      title={title}
      description={description}
      actions={actions}
    >
      <WeddingForm
        wedding={wedding}
        formId={formId}
        onLoadingChange={setIsLoading}
      />
    </PageContainer>
  )
}
