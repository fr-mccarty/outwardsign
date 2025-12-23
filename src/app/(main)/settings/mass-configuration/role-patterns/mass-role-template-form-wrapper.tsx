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
}: MassRoleTemplateFormWrapperProps) {
  const [isLoading, setIsLoading] = useState(false)
  const formId = 'mass-role-template-form'
  const isEditing = !!template

  return (
    <PageContainer
      title={title}
      description={description}
      primaryAction={<SaveButton moduleName="Mass Role Template" isLoading={isLoading} isEditing={isEditing} form={formId} />}
      additionalActions={isEditing ? [
        {
          type: 'action',
          label: 'View Mass Role Template',
          href: `/settings/mass-configuration/role-patterns/${template.id}`
        }
      ] : undefined}
    >
      <MassRoleTemplateForm
        template={template}
        formId={formId}
        onLoadingChange={setIsLoading}
      />
    </PageContainer>
  )
}
