'use client'

import React, { useState } from 'react'
import { PersonForm } from './person-form'
import { PageContainer } from '@/components/page-container'
import { Button } from '@/components/ui/button'
import { SaveButton } from '@/components/save-button'
import { Eye } from 'lucide-react'
import Link from 'next/link'
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
        <Button variant="outline" asChild>
          <Link href={`/people/${person.id}`}>
            <Eye className="h-4 w-4 mr-2" />
            View Person
          </Link>
        </Button>
      )}
      <SaveButton isLoading={isLoading} form={formId}>
        {saveButtonLabel}
      </SaveButton>
    </>
  )

  return (
    <PageContainer
      title={title}
      description={description}
      maxWidth="4xl"
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
