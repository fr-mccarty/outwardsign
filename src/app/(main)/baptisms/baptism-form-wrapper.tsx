'use client'

import React, { useState } from 'react'
import { BaptismForm } from './baptism-form'
import { PageContainer } from '@/components/page-container'
import { Button } from '@/components/ui/button'
import { ModuleSaveButton } from '@/components/module-save-button'
import { Eye } from 'lucide-react'
import Link from 'next/link'
import type { Baptism } from '@/lib/types'

interface BaptismFormWrapperProps {
  baptism?: Baptism
  title: string
  description: string
  saveButtonLabel: string
}

export function BaptismFormWrapper({
  baptism,
  title,
  description,
  saveButtonLabel
}: BaptismFormWrapperProps) {
  const formId = 'baptism-form'
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!baptism

  const actions = (
    <>
      {isEditing && (
        <Button variant="outline" asChild>
          <Link href={`/baptisms/${baptism.id}`}>
            <Eye className="h-4 w-4 mr-2" />
            View Baptism
          </Link>
        </Button>
      )}
      <ModuleSaveButton moduleName="Baptism" isLoading={isLoading} isEditing={isEditing} form={formId} />
    </>
  )

  return (
    <PageContainer
      title={title}
      description={description}
      actions={actions}
    >
      <BaptismForm
        baptism={baptism}
        formId={formId}
        onLoadingChange={setIsLoading}
      />
    </PageContainer>
  )
}
