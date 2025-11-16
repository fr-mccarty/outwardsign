'use client'

import React, { useState } from 'react'
import { MassForm } from './mass-form'
import { PageContainer } from '@/components/page-container'
import { Button } from '@/components/ui/button'
import { SaveButton } from '@/components/save-button'
import { Eye } from 'lucide-react'
import Link from 'next/link'
import type { MassWithRelations } from '@/lib/actions/masses'

interface MassFormWrapperProps {
  mass?: MassWithRelations
  title: string
  description: string
  saveButtonLabel: string
}

export function MassFormWrapper({
  mass,
  title,
  description,
  saveButtonLabel
}: MassFormWrapperProps) {
  const formId = 'mass-form'
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!mass

  const actions = (
    <>
      {isEditing && (
        <Button variant="outline" asChild>
          <Link href={`/masses/${mass.id}`}>
            <Eye className="h-4 w-4 mr-2" />
            View Mass
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
      <MassForm
        mass={mass}
        formId={formId}
        onLoadingChange={setIsLoading}
      />
    </PageContainer>
  )
}
