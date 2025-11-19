'use client'

import React, { useState } from 'react'
import { MassIntentionForm } from './mass-intention-form'
import { PageContainer } from '@/components/page-container'
import { ModuleSaveButton } from '@/components/module-save-button'
import { ModuleViewButton } from '@/components/module-view-button'
import type { MassIntentionWithRelations } from '@/lib/actions/mass-intentions'

interface MassIntentionFormWrapperProps {
  intention?: MassIntentionWithRelations
  title: string
  description: string
  saveButtonLabel: string
}

export function MassIntentionFormWrapper({
  intention,
  title,
  description,
  saveButtonLabel
}: MassIntentionFormWrapperProps) {
  const formId = 'mass-intention-form'
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!intention

  const actions = (
    <>
      {isEditing && (
        <ModuleViewButton moduleName="Intention" href={`/mass-intentions/${intention.id}`} />
      )}
      <ModuleSaveButton moduleName="Mass Intention" isLoading={isLoading} isEditing={isEditing} form={formId} />
    </>
  )

  return (
    <PageContainer
      title={title}
      description={description}
      actions={actions}
    >
      <MassIntentionForm
        intention={intention}
        formId={formId}
        onLoadingChange={setIsLoading}
      />
    </PageContainer>
  )
}
