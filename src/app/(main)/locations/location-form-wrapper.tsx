'use client'

import { ModuleFormWrapper } from '@/components/module-form-wrapper'
import { LocationForm } from './location-form'
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
  return (
    <ModuleFormWrapper
      title={title}
      description={description}
      moduleName="Location"
      viewPath="/locations"
      entity={location}
    >
      {({ formId, onLoadingChange }) => (
        <LocationForm
          location={location}
          formId={formId}
          onLoadingChange={onLoadingChange}
        />
      )}
    </ModuleFormWrapper>
  )
}
