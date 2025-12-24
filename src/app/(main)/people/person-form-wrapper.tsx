'use client'

import { ModuleFormWrapper } from '@/components/module-form-wrapper'
import { PersonForm } from './person-form'
import type { Person } from '@/lib/types'

interface PersonFormWrapperProps {
  person?: Person
  title: string
  description: string
}

export function PersonFormWrapper({
  person,
  title,
  description
}: PersonFormWrapperProps) {
  return (
    <ModuleFormWrapper
      title={title}
      description={description}
      moduleName="Person"
      viewPath="/people"
      entity={person}
    >
      {({ formId, onLoadingChange }) => (
        <PersonForm
          person={person}
          formId={formId}
          onLoadingChange={onLoadingChange}
        />
      )}
    </ModuleFormWrapper>
  )
}
