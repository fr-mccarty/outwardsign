'use client'

import React, { useState } from 'react'
import { MassIntentionForm } from './mass-intention-form'
import { PageContainer } from '@/components/page-container'
import { SaveButton } from '@/components/save-button'
import type { MassIntentionWithRelations } from '@/lib/actions/mass-intentions'

interface MassIntentionFormWrapperProps {
  intention?: MassIntentionWithRelations
  title: string
  description: string
}

export function MassIntentionFormWrapper({
  intention,
  title,
  description
}: MassIntentionFormWrapperProps) {
  const formId = 'mass-intention-form'
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!intention

  return (
    <PageContainer
      title={title}
      description={description}
      primaryAction={<SaveButton moduleName="Mass Intention" isLoading={isLoading} isEditing={isEditing} form={formId} />}
      additionalActions={isEditing ? [
        {
          type: 'action',
          label: 'View Mass Intention',
          href: `/mass-intentions/${intention.id}`
        }
      ] : undefined}
    >
      <MassIntentionForm
        intention={intention}
        formId={formId}
        onLoadingChange={setIsLoading}
      />
    </PageContainer>
  )
}
