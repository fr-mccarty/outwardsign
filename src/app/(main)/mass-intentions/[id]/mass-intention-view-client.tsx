"use client"

import { MassIntentionWithRelations, updateMassIntention } from '@/lib/actions/mass-intentions'
import { ModuleViewContainer } from '@/components/module-view-container'
import { buildMassIntentionLiturgy, MASS_INTENTION_TEMPLATES } from '@/lib/content-builders/mass-intention'

interface MassIntentionViewClientProps {
  intention: MassIntentionWithRelations
}

export function MassIntentionViewClient({ intention }: MassIntentionViewClientProps) {
  // Generate filename for downloads
  const generateFilename = (extension: string) => {
    const intentionFor = intention.mass_offered_for?.substring(0, 30).replace(/[^a-z0-9]/gi, '-') || 'Intention'
    const dateRequested = intention.date_requested
      ? new Date(intention.date_requested).toISOString().split('T')[0].replace(/-/g, '')
      : 'NoDate'
    return `MassIntention-${intentionFor}-${dateRequested}.${extension}`
  }

  // Extract template ID from mass intention record
  const getTemplateId = (intention: MassIntentionWithRelations) => {
    return intention.mass_intention_template_id || 'mass-intention-summary-english'
  }

  // Handle template update
  const handleUpdateTemplate = async (templateId: string) => {
    await updateMassIntention(intention.id, {
      mass_intention_template_id: templateId,
    })
  }

  return (
    <ModuleViewContainer
      entity={intention}
      entityType="Mass Intention"
      modulePath="mass-intentions"
      generateFilename={generateFilename}
      buildLiturgy={buildMassIntentionLiturgy}
      getTemplateId={getTemplateId}
      statusType="mass-intention"
      templateConfig={{
        currentTemplateId: intention.mass_intention_template_id,
        templates: MASS_INTENTION_TEMPLATES,
        templateFieldName: 'mass_intention_template_id',
        defaultTemplateId: 'mass-intention-summary-english',
        onUpdateTemplate: handleUpdateTemplate,
      }}
    />
  )
}
