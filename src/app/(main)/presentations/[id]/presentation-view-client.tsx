"use client"

import { PresentationWithRelations } from '@/lib/actions/presentations'
import { ModuleViewContainer } from '@/components/module-view-container'
import { buildPresentationLiturgy } from '@/lib/content-builders/presentation'

interface PresentationViewClientProps {
  presentation: PresentationWithRelations
}

export function PresentationViewClient({ presentation }: PresentationViewClientProps) {
  // Generate filename for downloads
  const generateFilename = (extension: string) => {
    const childLastName = presentation.child?.last_name || 'Child'
    const presentationDate = presentation.presentation_event?.start_date
      ? new Date(presentation.presentation_event.start_date).toISOString().split('T')[0].replace(/-/g, '')
      : 'NoDate'
    return `presentation-${childLastName}-${presentationDate}.${extension}`
  }

  // Extract template ID from presentation record
  const getTemplateId = (presentation: PresentationWithRelations) => {
    return presentation.presentation_template_id || 'presentation-spanish'
  }

  return (
    <ModuleViewContainer
      entity={presentation}
      entityType="Presentation"
      modulePath="presentations"
      mainEvent={presentation.presentation_event}
      generateFilename={generateFilename}
      buildLiturgy={buildPresentationLiturgy}
      getTemplateId={getTemplateId}
    />
  )
}
