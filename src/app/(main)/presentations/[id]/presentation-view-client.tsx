"use client"

import { PresentationWithRelations, updatePresentation, deletePresentation } from '@/lib/actions/presentations'
import { ModuleViewContainer } from '@/components/module-view-container'
import { buildPresentationLiturgy, PRESENTATION_TEMPLATES } from '@/lib/content-builders/presentation'

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

  // Handle template update
  const handleUpdateTemplate = async (templateId: string) => {
    await updatePresentation(presentation.id, {
      presentation_template_id: templateId,
    })
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
      templateConfig={{
        currentTemplateId: presentation.presentation_template_id,
        templates: PRESENTATION_TEMPLATES,
        templateFieldName: 'presentation_template_id',
        defaultTemplateId: 'presentation-spanish',
        onUpdateTemplate: handleUpdateTemplate,
      }}
      onDelete={deletePresentation}
    />
  )
}
