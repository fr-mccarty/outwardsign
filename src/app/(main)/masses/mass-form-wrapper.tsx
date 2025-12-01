'use client'

import React, { useState } from 'react'
import { MassForm } from './mass-form'
import { PageContainer } from '@/components/page-container'
import { ModuleSaveButton } from '@/components/module-save-button'
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

  return (
    <PageContainer
      title={title}
      description={description}
      primaryAction={<ModuleSaveButton moduleName="Mass" isLoading={isLoading} isEditing={isEditing} form={formId} />}
      additionalActions={isEditing ? [
        {
          type: 'action',
          label: 'View Mass',
          href: `/masses/${mass.id}`
        }
      ] : undefined}
    >
      <MassForm
        mass={mass}
        formId={formId}
        onLoadingChange={setIsLoading}
      />
    </PageContainer>
  )
}
