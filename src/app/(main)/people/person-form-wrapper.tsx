'use client'

import React, { useState } from 'react'
import { PersonForm } from './person-form'
import { PageContainer } from '@/components/page-container'
import { ModuleSaveButton } from '@/components/module-save-button'
import { ModuleViewButton } from '@/components/module-view-button'
import type { Person } from '@/lib/types'

interface PersonFormWrapperProps {
  person?: Person
  title: string
  description: string
  saveButtonLabel: string
}

export function PersonFormWrapper({
  person,
  title,
  description,
  saveButtonLabel
}: PersonFormWrapperProps) {
  const formId = 'person-form'
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!person

  const actions = (
    <>
      {isEditing && (
        <ModuleViewButton moduleName="Person" href={`/people/${person.id}`} />
      )}
      <ModuleSaveButton moduleName="Person" isLoading={isLoading} isEditing={isEditing} form={formId} />
    </>
  )

  return (
    <PageContainer
      title={title}
      description={description}
      actions={actions}
    >
      <PersonForm
        person={person}
        formId={formId}
        onLoadingChange={setIsLoading}
      />
    </PageContainer>
  )
}
