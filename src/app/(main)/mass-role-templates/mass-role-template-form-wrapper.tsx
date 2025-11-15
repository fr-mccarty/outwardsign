"use client"

import { useState } from 'react'
import { MassRoleTemplateForm } from './mass-role-template-form'
import { PageContainer } from '@/components/page-container'
import { SaveButton } from '@/components/save-button'
import { CancelButton } from '@/components/cancel-button'
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

  // Determine cancel URL based on mode
  const cancelUrl = isEditing
    ? `/mass-role-templates/${template.id}`
    : '/mass-role-templates'

  return (
    <PageContainer
      title={title}
      description={description}
      maxWidth="5xl"
      actions={
        isEditing ? (
          <div className="flex gap-2">
            <CancelButton href={cancelUrl} />
            <SaveButton form={formId} disabled={isLoading} />
          </div>
        ) : undefined
      }
    >
      <MassRoleTemplateForm
        template={template}
        formId={formId}
        onLoadingChange={setIsLoading}
      />
    </PageContainer>
  )
}
