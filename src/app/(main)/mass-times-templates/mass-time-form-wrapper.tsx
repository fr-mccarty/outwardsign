'use client'

import { useState } from 'react'
import { PageContainer } from '@/components/page-container'
import { ModuleSaveButton } from '@/components/module-save-button'
import { ModuleViewButton } from '@/components/module-view-button'
import { MassTimeForm } from './mass-time-form'
import type { MassTimeWithRelations } from '@/lib/actions/mass-times'
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

  const actions = (
    <>
      {isEditing && (
        <ModuleViewButton moduleName="Template" href={`/mass-times-templates/${massTime.id}`} />
      )}
      <ModuleSaveButton moduleName="Template" isLoading={isLoading} isEditing={isEditing} form={formId} />
    </>
  )

  return (
    <PageContainer
      title={title || defaultTitle}
      description={description || defaultDescription}
      actions={actions}
    >
      <MassTimeForm massTime={massTime} items={items} formId={formId} onLoadingChange={setIsLoading} />
    </PageContainer>
  )
}
