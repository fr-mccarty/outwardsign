'use client'

import React, { useState } from 'react'
import { MassIntentionForm } from './mass-intention-form'
import { PageContainer } from '@/components/page-container'
import { Button } from '@/components/ui/button'
import { SaveButton } from '@/components/save-button'
import { Eye } from 'lucide-react'
import Link from 'next/link'
import type { MassIntentionWithRelations } from '@/lib/actions/mass-intentions'

interface MassIntentionFormWrapperProps {
  intention?: MassIntentionWithRelations
  title: string
  description: string
  saveButtonLabel: string
}

export function MassIntentionFormWrapper({
  intention,
  title,
  description,
  saveButtonLabel
}: MassIntentionFormWrapperProps) {
  const formId = 'mass-intention-form'
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!intention

  const actions = (
    <>
      {isEditing && (
        <Button variant="outline" asChild>
          <Link href={`/mass-intentions/${intention.id}`}>
            <Eye className="h-4 w-4 mr-2" />
            View Intention
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
      <MassIntentionForm
        intention={intention}
        formId={formId}
        onLoadingChange={setIsLoading}
      />
    </PageContainer>
  )
}
