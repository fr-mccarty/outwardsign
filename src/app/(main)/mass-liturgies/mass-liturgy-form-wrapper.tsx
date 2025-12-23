'use client'

import React, { useState } from 'react'
import { MassLiturgyForm } from './mass-liturgy-form'
import { PageContainer } from '@/components/page-container'
import { SaveButton } from '@/components/save-button'
import type { MassWithRelations } from '@/lib/schemas/mass-liturgies'
import type { LiturgicalCalendarEvent } from '@/lib/actions/liturgical-calendar'

interface MassLiturgyFormWrapperProps {
  mass?: MassWithRelations
  title: string
  description: string
  initialLiturgicalEvent?: LiturgicalCalendarEvent | null
}

export function MassLiturgyFormWrapper({
  mass,
  title,
  description,
  initialLiturgicalEvent
}: MassLiturgyFormWrapperProps) {
  const formId = 'mass-form'
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!mass

  return (
    <PageContainer
      title={title}
      description={description}
      primaryAction={<SaveButton moduleName="Mass" isLoading={isLoading} isEditing={isEditing} form={formId} />}
      additionalActions={isEditing ? [
        {
          type: 'action',
          label: 'View Mass',
          href: `/mass-liturgies/${mass.id}`
        }
      ] : undefined}
    >
      <MassLiturgyForm
        mass={mass}
        formId={formId}
        onLoadingChange={setIsLoading}
        initialLiturgicalEvent={initialLiturgicalEvent}
      />
    </PageContainer>
  )
}
