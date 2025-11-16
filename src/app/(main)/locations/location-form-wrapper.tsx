'use client'

import React, { useState } from 'react'
import { LocationForm } from './location-form'
import { PageContainer } from '@/components/page-container'
import { Button } from '@/components/ui/button'
import { SaveButton } from '@/components/save-button'
import { Eye } from 'lucide-react'
import Link from 'next/link'
import type { Location } from '@/lib/types'

interface LocationFormWrapperProps {
  location?: Location
  title: string
  description: string
  saveButtonLabel: string
}

export function LocationFormWrapper({
  location,
  title,
  description,
  saveButtonLabel
}: LocationFormWrapperProps) {
  const formId = 'location-form'
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!location

  const actions = (
    <>
      {isEditing && (
        <Button variant="outline" asChild>
          <Link href={`/locations/${location.id}`}>
            <Eye className="h-4 w-4 mr-2" />
            View Location
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
      <LocationForm
        location={location}
        formId={formId}
        onLoadingChange={setIsLoading}
      />
    </PageContainer>
  )
}
