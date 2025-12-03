'use client'

import React, { useState } from 'react'
import { GroupForm } from './group-form'
import { PageContainer } from '@/components/page-container'
import { ModuleSaveButton } from '@/components/module-save-button'
import type { GroupWithMembers } from '@/lib/actions/groups'

interface GroupFormWrapperProps {
  group?: GroupWithMembers
  title: string
  description: string
}

export function GroupFormWrapper({
  group,
  title,
  description
}: GroupFormWrapperProps) {
  const formId = 'group-form'
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!group

  return (
    <PageContainer
      title={title}
      description={description}
      primaryAction={<ModuleSaveButton moduleName="Group" isLoading={isLoading} isEditing={isEditing} form={formId} />}
      additionalActions={isEditing ? [
        {
          type: 'action',
          label: 'View Group',
          href: `/groups/${group.id}`
        }
      ] : undefined}
    >
      <GroupForm
        group={group}
        formId={formId}
        onLoadingChange={setIsLoading}
      />
    </PageContainer>
  )
}
