'use client'

import React, { useState } from 'react'
import { PresentationForm } from './presentation-form'
import { PageContainer } from '@/components/page-container'
import { Button } from '@/components/ui/button'
import { SaveButton } from '@/components/save-button'
import { Eye } from 'lucide-react'
import Link from 'next/link'
import type { PresentationWithRelations } from '@/lib/actions/presentations'

interface PresentationFormWrapperProps {
  presentation?: PresentationWithRelations
  title: string
  description: string
  saveButtonLabel: string
}

export function PresentationFormWrapper({
  presentation,
  title,
  description,
  saveButtonLabel
}: PresentationFormWrapperProps) {
  const formId = 'presentation-form'
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!presentation

  const actions = (
    <>
      {isEditing && (
        <Button variant="outline" asChild>
          <Link href={`/presentations/${presentation.id}`}>
            <Eye className="h-4 w-4 mr-2" />
            View Presentation
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
      actions={actions}
    >
      <PresentationForm
        presentation={presentation}
        formId={formId}
        onLoadingChange={setIsLoading}
      />
    </PageContainer>
  )
}
