'use client'

import { ModuleFormWrapper } from '@/components/module-form-wrapper'
import { GroupForm } from './group-form'
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
  return (
    <ModuleFormWrapper
      title={title}
      description={description}
      moduleName="Group"
      viewPath="/groups"
      entity={group}
    >
      {({ formId, onLoadingChange }) => (
        <GroupForm
          group={group}
          formId={formId}
          onLoadingChange={onLoadingChange}
        />
      )}
    </ModuleFormWrapper>
  )
}
