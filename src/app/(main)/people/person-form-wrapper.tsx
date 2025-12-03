'use client'

import React, { useState } from 'react'
import { PersonForm } from './person-form'
import { PageContainer } from '@/components/page-container'
import { ModuleSaveButton } from '@/components/module-save-button'
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
  const formId = 'person-form'
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!person

  return (
    <PageContainer
      title={title}
      description={description}
      primaryAction={<ModuleSaveButton moduleName="Person" isLoading={isLoading} isEditing={isEditing} form={formId} />}
      additionalActions={isEditing ? [
        {
          type: 'action',
          label: 'View Person',
          href: `/people/${person.id}`
        }
      ] : undefined}
    >
      <PersonForm
        person={person}
        formId={formId}
        onLoadingChange={setIsLoading}
      />
    </PageContainer>
  )
}
