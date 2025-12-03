'use client'

import React, { useState } from 'react'
import { OciaSessionForm } from './ocia-session-form'
import { PageContainer } from '@/components/page-container'
import { ModuleSaveButton } from '@/components/module-save-button'
import type { OciaSessionWithRelations } from '@/lib/actions/ocia-sessions'

interface OciaSessionFormWrapperProps {
  ociaSession?: OciaSessionWithRelations
  title: string
  description: string
}

export function OciaSessionFormWrapper({
  ociaSession,
  title,
  description
}: OciaSessionFormWrapperProps) {
  const formId = 'ocia-session-form'
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!ociaSession

  return (
    <PageContainer
      title={title}
      description={description}
      primaryAction={<ModuleSaveButton moduleName="OCIA Session" isLoading={isLoading} isEditing={isEditing} form={formId} />}
      additionalActions={isEditing ? [
        {
          type: 'action',
          label: 'View OCIA Session',
          href: `/ocia-sessions/${ociaSession.id}`
        }
      ] : undefined}
    >
      <OciaSessionForm
        ociaSession={ociaSession}
        formId={formId}
        onLoadingChange={setIsLoading}
      />
    </PageContainer>
  )
}
