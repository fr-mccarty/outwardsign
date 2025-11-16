'use client'

import React, { useState } from 'react'
import { FuneralForm } from './funeral-form'
import { PageContainer } from '@/components/page-container'
import { Button } from '@/components/ui/button'
import { SaveButton } from '@/components/save-button'
import { Eye } from 'lucide-react'
import Link from 'next/link'
import type { Funeral } from '@/lib/types'

interface FuneralFormWrapperProps {
  funeral?: Funeral
  title: string
  description: string
  saveButtonLabel: string
}

export function FuneralFormWrapper({
  funeral,
  title,
  description,
  saveButtonLabel
}: FuneralFormWrapperProps) {
  const formId = 'funeral-form'
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!funeral

  const actions = (
    <>
      {isEditing && (
        <Button variant="outline" asChild>
          <Link href={`/funerals/${funeral.id}`}>
            <Eye className="h-4 w-4 mr-2" />
            View Funeral
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
      <FuneralForm
        funeral={funeral}
        formId={formId}
        onLoadingChange={setIsLoading}
      />
    </PageContainer>
  )
}
