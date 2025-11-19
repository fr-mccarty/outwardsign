'use client'

import React, { useState } from 'react'
import { BaptismForm } from './baptism-form'
import { PageContainer } from '@/components/page-container'
import { ModuleSaveButton } from '@/components/module-save-button'
import { ModuleViewButton } from '@/components/module-view-button'
import type { Baptism } from '@/lib/types'

interface BaptismFormWrapperProps {
  baptism?: Baptism
  title: string
  description: string
  saveButtonLabel: string
}

export function BaptismFormWrapper({
  baptism,
  title,
  description,
  saveButtonLabel
}: BaptismFormWrapperProps) {
  const formId = 'baptism-form'
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!baptism

  const actions = (
    <>
      {isEditing && (
        <ModuleViewButton moduleName="Baptism" href={`/baptisms/${baptism.id}`} />
      )}
      <ModuleSaveButton moduleName="Baptism" isLoading={isLoading} isEditing={isEditing} form={formId} />
    </>
  )

  return (
    <PageContainer
      title={title}
      description={description}
      actions={actions}
    >
      <BaptismForm
        baptism={baptism}
        formId={formId}
        onLoadingChange={setIsLoading}
      />
    </PageContainer>
  )
}
