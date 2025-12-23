'use client'

import { useState } from 'react'
import { PageContainer } from '@/components/page-container'
import { SaveButton } from '@/components/save-button'
import { MassTimeForm } from './mass-time-form'
import type { MassTimeWithRelations } from '@/lib/actions/mass-times-templates'
import type { MassTimesTemplateItem } from '@/lib/actions/mass-times-template-items'

interface MassTimeFormWrapperProps {
  massTime?: MassTimeWithRelations
  items?: MassTimesTemplateItem[]
  title?: string
  description?: string
}

export function MassTimeFormWrapper({ massTime, items, title, description }: MassTimeFormWrapperProps) {
  const formId = 'mass-time-form'
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!massTime
  const defaultTitle = isEditing ? 'Edit Mass Times Template' : 'Create Mass Times Template'
  const defaultDescription = isEditing
    ? 'Edit mass times template details.'
    : 'Create a new mass times template for different seasons or periods.'

  return (
    <PageContainer
      title={title || defaultTitle}
      description={description || defaultDescription}
      primaryAction={<SaveButton moduleName="Template" isLoading={isLoading} isEditing={isEditing} form={formId} />}
      additionalActions={isEditing ? [
        {
          type: 'action',
          label: 'View Mass Times Template',
          href: `/settings/mass-configuration/recurring-schedule/${massTime.id}`
        }
      ] : undefined}
    >
      <MassTimeForm massTime={massTime} items={items} formId={formId} onLoadingChange={setIsLoading} />
    </PageContainer>
  )
}
