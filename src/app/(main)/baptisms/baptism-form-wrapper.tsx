'use client'

import React, { useState } from 'react'
import { BaptismForm } from './baptism-form'
import { PageContainer } from '@/components/page-container'
import { ModuleSaveButton } from '@/components/module-save-button'
import type { Baptism } from '@/lib/types'

interface BaptismFormWrapperProps {
  baptism?: Baptism
  title: string
  description: string
}

export function BaptismFormWrapper({
  baptism,
  title,
  description
}: BaptismFormWrapperProps) {
  const formId = 'baptism-form'
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!baptism

  return (
    <PageContainer
      title={title}
      description={description}
      primaryAction={<ModuleSaveButton moduleName="Baptism" isLoading={isLoading} isEditing={isEditing} form={formId} />}
      additionalActions={isEditing ? [
        {
          type: 'action',
          label: 'View Baptism',
          href: `/baptisms/${baptism.id}`
        }
      ] : undefined}
    >
      <BaptismForm
        baptism={baptism}
        formId={formId}
        onLoadingChange={setIsLoading}
      />
    </PageContainer>
  )
}
