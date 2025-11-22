'use client'

import React, { useState } from 'react'
import { GroupForm } from './group-form'
import { PageContainer } from '@/components/page-container'
import { ModuleSaveButton } from '@/components/module-save-button'
import { ModuleViewButton } from '@/components/module-view-button'
import type { GroupWithMembers } from '@/lib/actions/groups'

interface GroupFormWrapperProps {
  group?: GroupWithMembers
  title: string
  description: string
  saveButtonLabel: string
}

export function GroupFormWrapper({
  group,
  title,
  description,
  saveButtonLabel
}: GroupFormWrapperProps) {
  const formId = 'group-form'
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!group

  const actions = (
    <>
      {isEditing && (
        <ModuleViewButton moduleName="Group" href={`/groups/${group.id}`} />
      )}
      <ModuleSaveButton moduleName="Group" isLoading={isLoading} isEditing={isEditing} form={formId} />
    </>
  )

  return (
    <PageContainer
      title={title}
      description={description}
      actions={actions}
    >
      <GroupForm
        group={group}
        formId={formId}
        onLoadingChange={setIsLoading}
      />
    </PageContainer>
  )
}
