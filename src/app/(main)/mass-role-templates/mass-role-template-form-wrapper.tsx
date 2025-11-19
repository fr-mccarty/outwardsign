"use client"

import { useState } from 'react'
import { MassRoleTemplateForm } from './mass-role-template-form'
import { PageContainer } from '@/components/page-container'
import { ModuleSaveButton } from '@/components/module-save-button'
import { ModuleViewButton } from '@/components/module-view-button'
import type { MassRoleTemplate } from '@/lib/actions/mass-role-templates'

interface MassRoleTemplateFormWrapperProps {
  template?: MassRoleTemplate
  title: string
  description: string
  breadcrumbs: Array<{ label: string; href?: string }>
}

export function MassRoleTemplateFormWrapper({
  template,
  title,
  description,
}: MassRoleTemplateFormWrapperProps) {
  const [isLoading, setIsLoading] = useState(false)
  const formId = 'mass-role-template-form'
  const isEditing = !!template

  const actions = (
    <>
      {isEditing && (
        <ModuleViewButton moduleName="Template" href={`/mass-role-templates/${template.id}`} />
      )}
      <ModuleSaveButton moduleName="Mass Role Template" isLoading={isLoading} isEditing={isEditing} form={formId} />
    </>
  )

  return (
    <PageContainer
      title={title}
      description={description}
      actions={actions}
    >
      <MassRoleTemplateForm
        template={template}
        formId={formId}
        onLoadingChange={setIsLoading}
      />
    </PageContainer>
  )
}
