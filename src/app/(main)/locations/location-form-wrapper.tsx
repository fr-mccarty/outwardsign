'use client'

import React, { useState } from 'react'
import { LocationForm } from './location-form'
import { PageContainer } from '@/components/page-container'
import { SaveButton } from '@/components/save-button'
import type { Location } from '@/lib/types'

interface LocationFormWrapperProps {
  location?: Location
  title: string
  description: string
}

export function LocationFormWrapper({
  location,
  title,
  description
}: LocationFormWrapperProps) {
  const formId = 'location-form'
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!location

  return (
    <PageContainer
      title={title}
      description={description}
      primaryAction={<SaveButton moduleName="Location" isLoading={isLoading} isEditing={isEditing} form={formId} />}
      additionalActions={isEditing ? [
        {
          type: 'action',
          label: 'View Location',
          href: `/locations/${location.id}`
        }
      ] : undefined}
    >
      <LocationForm
        location={location}
        formId={formId}
        onLoadingChange={setIsLoading}
      />
    </PageContainer>
  )
}
