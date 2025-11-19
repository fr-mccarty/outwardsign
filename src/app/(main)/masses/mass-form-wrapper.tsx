'use client'

import React, { useState } from 'react'
import { MassForm } from './mass-form'
import { PageContainer } from '@/components/page-container'
import { ModuleSaveButton } from '@/components/module-save-button'
import { ModuleViewButton } from '@/components/module-view-button'
import type { MassWithRelations } from '@/lib/actions/masses'

interface MassFormWrapperProps {
  mass?: MassWithRelations
  title: string
  description: string
  saveButtonLabel: string
}

export function MassFormWrapper({
  mass,
  title,
  description,
  saveButtonLabel
}: MassFormWrapperProps) {
  const formId = 'mass-form'
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!mass

  const actions = (
    <>
      {isEditing && (
        <ModuleViewButton moduleName="Mass" href={`/masses/${mass.id}`} />
      )}
      <ModuleSaveButton moduleName="Mass" isLoading={isLoading} isEditing={isEditing} form={formId} />
    </>
  )

  return (
    <PageContainer
      title={title}
      description={description}
      actions={actions}
    >
      <MassForm
        mass={mass}
        formId={formId}
        onLoadingChange={setIsLoading}
      />
    </PageContainer>
  )
}
