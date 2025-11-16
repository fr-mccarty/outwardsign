"use client"

import { FuneralWithRelations, updateFuneral } from '@/lib/actions/funerals'
import { ModuleViewContainer } from '@/components/module-view-container'
import { buildFuneralLiturgy, FUNERAL_TEMPLATES } from '@/lib/content-builders/funeral'

interface FuneralViewClientProps {
  funeral: FuneralWithRelations
}

export function FuneralViewClient({ funeral }: FuneralViewClientProps) {
  // Generate filename for downloads
  const generateFilename = (extension: string) => {
    const deceasedLastName = funeral.deceased?.last_name || 'Deceased'
    const funeralDate = funeral.funeral_event?.start_date
      ? new Date(funeral.funeral_event.start_date).toISOString().split('T')[0].replace(/-/g, '')
      : 'NoDate'
    return `${deceasedLastName}-Funeral-${funeralDate}.${extension}`
  }

  // Extract template ID from funeral record
  const getTemplateId = (funeral: FuneralWithRelations) => {
    return funeral.funeral_template_id || 'funeral-full-script-english'
  }

  // Handle template update
  const handleUpdateTemplate = async (templateId: string) => {
    await updateFuneral(funeral.id, {
      funeral_template_id: templateId,
    })
  }

  return (
    <ModuleViewContainer
      entity={funeral}
      entityType="Funeral"
      modulePath="funerals"
      mainEvent={funeral.funeral_event}
      generateFilename={generateFilename}
      buildLiturgy={buildFuneralLiturgy}
      getTemplateId={getTemplateId}
      templateConfig={{
        currentTemplateId: funeral.funeral_template_id,
        templates: FUNERAL_TEMPLATES,
        templateFieldName: 'funeral_template_id',
        defaultTemplateId: 'funeral-full-script-english',
        onUpdateTemplate: handleUpdateTemplate,
      }}
    />
  )
}
