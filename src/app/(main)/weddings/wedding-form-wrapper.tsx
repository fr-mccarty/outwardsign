'use client'

import React, { useState } from 'react'
import { WeddingForm } from './wedding-form'
import { PageContainer } from '@/components/page-container'
import { Button } from '@/components/ui/button'
import { SaveButton } from '@/components/save-button'
import { Eye } from 'lucide-react'
import Link from 'next/link'
import type { Wedding } from '@/lib/types'

interface WeddingFormWrapperProps {
  wedding?: Wedding
  title: string
  description: string
  saveButtonLabel: string
}

export function WeddingFormWrapper({
  wedding,
  title,
  description,
  saveButtonLabel
}: WeddingFormWrapperProps) {
  const formId = 'wedding-form'
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!wedding

  const actions = (
    <>
      {isEditing && (
        <Button variant="outline" asChild>
          <Link href={`/weddings/${wedding.id}`}>
            <Eye className="h-4 w-4 mr-2" />
            View Wedding
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
      <WeddingForm
        wedding={wedding}
        formId={formId}
        onLoadingChange={setIsLoading}
      />
    </PageContainer>
  )
}
