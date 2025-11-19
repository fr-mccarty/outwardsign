'use client'

import React, { useState } from 'react'
import { QuinceaneraForm } from './quinceanera-form'
import { PageContainer } from '@/components/page-container'
import { ModuleSaveButton } from '@/components/module-save-button'
import { ModuleViewButton } from '@/components/module-view-button'
import type { Quinceanera } from '@/lib/types'

interface QuinceaneraFormWrapperProps {
  quinceanera?: Quinceanera
  title: string
  description: string
  saveButtonLabel: string
}

export function QuinceaneraFormWrapper({
  quinceanera,
  title,
  description,
  saveButtonLabel
}: QuinceaneraFormWrapperProps) {
  const formId = 'quinceanera-form'
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!quinceanera

  const actions = (
    <>
      {isEditing && (
        <ModuleViewButton moduleName="Quinceañera" href={`/quinceaneras/${quinceanera.id}`} />
      )}
      <ModuleSaveButton moduleName="Quinceañera" isLoading={isLoading} isEditing={isEditing} form={formId} />
    </>
  )

  return (
    <PageContainer
      title={title}
      description={description}
      actions={actions}
    >
      <QuinceaneraForm
        quinceanera={quinceanera}
        formId={formId}
        onLoadingChange={setIsLoading}
      />
    </PageContainer>
  )
}
