"use client"

import { useState } from 'react'
import { MassRoleTemplateForm } from './mass-role-template-form'
import { PageContainer } from '@/components/page-container'
import { SaveButton } from '@/components/save-button'
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
  breadcrumbs
}: MassRoleTemplateFormWrapperProps) {
  const [isLoading, setIsLoading] = useState(false)
  const formId = 'mass-role-template-form'
  const isEditing = !!template

  // Determine save button label to match bottom button
  const saveButtonLabel = isEditing ? 'Update Template' : 'Create Template'

  const actions = (
    <SaveButton isLoading={isLoading} form={formId}>
      {saveButtonLabel}
    </SaveButton>
  )

  return (
    <PageContainer
      title={title}
      description={description}
      maxWidth="5xl"
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
