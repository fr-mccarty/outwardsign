"use client"

import { QuinceaneraWithRelations, updateQuinceanera, deleteQuinceanera } from '@/lib/actions/quinceaneras'
import { ModuleViewContainer } from '@/components/module-view-container'
import { buildQuinceaneraLiturgy, QUINCEANERA_TEMPLATES } from '@/lib/content-builders/quinceanera'

interface QuinceaneraViewClientProps {
  quinceanera: QuinceaneraWithRelations
}

export function QuinceaneraViewClient({ quinceanera }: QuinceaneraViewClientProps) {
  // Generate filename for downloads
  const generateFilename = (extension: string) => {
    const quinceaneraLastName = quinceanera.quinceanera?.last_name || 'Quinceanera'
    const quinceaneraDate = quinceanera.quinceanera_event?.start_date
      ? new Date(quinceanera.quinceanera_event.start_date).toISOString().split('T')[0].replace(/-/g, '')
      : 'NoDate'
    return `${quinceaneraLastName}-Quinceanera-${quinceaneraDate}.${extension}`
  }

  // Extract template ID from quinceanera record
  const getTemplateId = (quinceanera: QuinceaneraWithRelations) => {
    return quinceanera.quinceanera_template_id || 'quinceanera-full-script-english'
  }

  // Handle template update
  const handleUpdateTemplate = async (templateId: string) => {
    await updateQuinceanera(quinceanera.id, {
      quinceanera_template_id: templateId,
    })
  }

  return (
    <ModuleViewContainer
      entity={quinceanera}
      entityType="Quinceañera"
      modulePath="quinceaneras"
      mainEvent={quinceanera.quinceanera_event}
      generateFilename={generateFilename}
      buildLiturgy={buildQuinceaneraLiturgy}
      getTemplateId={getTemplateId}
      templateConfig={{
        currentTemplateId: quinceanera.quinceanera_template_id,
        templates: QUINCEANERA_TEMPLATES,
        templateFieldName: 'quinceanera_template_id',
        defaultTemplateId: 'quinceanera-full-script-english',
        onUpdateTemplate: handleUpdateTemplate,
      }}
      onDelete={deleteQuinceanera}
    />
  )
}
