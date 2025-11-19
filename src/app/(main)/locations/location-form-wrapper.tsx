'use client'

import React, { useState } from 'react'
import { LocationForm } from './location-form'
import { PageContainer } from '@/components/page-container'
import { ModuleSaveButton } from '@/components/module-save-button'
import { ModuleViewButton } from '@/components/module-view-button'
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
        <ModuleViewButton moduleName="Location" href={`/locations/${location.id}`} />
      )}
      <ModuleSaveButton moduleName="Location" isLoading={isLoading} isEditing={isEditing} form={formId} />
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
