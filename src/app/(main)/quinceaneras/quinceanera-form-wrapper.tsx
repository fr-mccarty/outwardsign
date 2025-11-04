'use client'

import React, { useState } from 'react'
import { QuinceaneraForm } from './quinceanera-form'
import { PageContainer } from '@/components/page-container'
import { Button } from '@/components/ui/button'
import { SaveButton } from '@/components/save-button'
import { Eye } from 'lucide-react'
import Link from 'next/link'
import type { Quinceanera } from '@/lib/types'

interface QuinceaneraFormWrapperProps {
  quinceanera?: Quinceanera
  title: string
  description: string
  saveButtonLabel: string
}

export function QuinceaneraFormWrapper({
  quinceanera,
  title,
  description,
  saveButtonLabel
}: QuinceaneraFormWrapperProps) {
  const formId = 'quinceanera-form'
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!quinceanera

  const actions = isEditing ? (
    <>
      <Button variant="outline" asChild>
        <Link href={`/quinceaneras/${quinceanera.id}`}>
          <Eye className="h-4 w-4 mr-2" />
          View Quinceañera
        </Link>
      </Button>
      <SaveButton isLoading={isLoading} form={formId}>
        Update Quinceañera
      </SaveButton>
    </>
  ) : null

  return (
    <PageContainer
      title={title}
      description={description}
      maxWidth="4xl"
      actions={actions}
    >
      <QuinceaneraForm
        quinceanera={quinceanera}
        formId={formId}
        onLoadingChange={setIsLoading}
      />
    </PageContainer>
  )
}
