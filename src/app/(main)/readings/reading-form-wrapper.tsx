'use client'

import React, { useState } from 'react'
import { ReadingForm } from './reading-form'
import { PageContainer } from '@/components/page-container'
import { Button } from '@/components/ui/button'
import { SaveButton } from '@/components/save-button'
import { Eye } from 'lucide-react'
import Link from 'next/link'
import type { Reading } from '@/lib/actions/readings'

interface ReadingFormWrapperProps {
  reading?: Reading
  title: string
  description: string
  saveButtonLabel: string
}

export function ReadingFormWrapper({
  reading,
  title,
  description,
  saveButtonLabel
}: ReadingFormWrapperProps) {
  const formId = 'reading-form'
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!reading

  const actions = (
    <>
      {isEditing && (
        <Button variant="outline" asChild>
          <Link href={`/readings/${reading.id}`}>
            <Eye className="h-4 w-4 mr-2" />
            View Reading
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
      <ReadingForm
        reading={reading}
        formId={formId}
        onLoadingChange={setIsLoading}
      />
    </PageContainer>
  )
}
