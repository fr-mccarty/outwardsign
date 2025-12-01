'use client'

import React, { useState } from 'react'
import { GroupBaptismForm } from './group-baptism-form'
import { PageContainer } from '@/components/page-container'
import { ModuleSaveButton } from '@/components/module-save-button'
import type { GroupBaptismWithRelations } from '@/lib/actions/group-baptisms'

interface GroupBaptismFormWrapperProps {
  groupBaptism?: GroupBaptismWithRelations
  title: string
  description: string
  saveButtonLabel?: string // Not used - kept for compatibility
}

export function GroupBaptismFormWrapper({
  groupBaptism,
  title,
  description,
  saveButtonLabel
}: GroupBaptismFormWrapperProps) {
  const formId = 'group-baptism-form'
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!groupBaptism

  return (
    <PageContainer
      title={title}
      description={description}
      primaryAction={<ModuleSaveButton moduleName="Group Baptism" isLoading={isLoading} isEditing={isEditing} form={formId} />}
      additionalActions={isEditing ? [
        {
          type: 'action',
          label: 'View Group Baptism',
          href: `/group-baptisms/${groupBaptism.id}`
        }
      ] : undefined}
    >
      <GroupBaptismForm
        groupBaptism={groupBaptism}
        formId={formId}
        onLoadingChange={setIsLoading}
      />
    </PageContainer>
  )
}
