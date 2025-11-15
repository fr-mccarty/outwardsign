"use client"

import { MassWithRelations } from '@/lib/actions/masses'
import { ModuleViewContainer } from '@/components/module-view-container'
// Note: buildMassLiturgy will be created in Phase 5
import { buildMassLiturgy } from '@/lib/content-builders/mass'

interface MassViewClientProps {
  mass: MassWithRelations
}

export function MassViewClient({ mass }: MassViewClientProps) {
  // Generate filename for downloads
  const generateFilename = (extension: string) => {
    const presiderLastName = mass.presider?.last_name || 'Presider'
    const eventDate = mass.event?.start_date
      ? new Date(mass.event.start_date).toISOString().split('T')[0].replace(/-/g, '')
      : 'NoDate'
    return `mass-${presiderLastName}-${eventDate}.${extension}`
  }

  // Extract template ID from mass record
  const getTemplateId = (mass: MassWithRelations) => {
    return mass.mass_template_id || 'mass-english'
  }

  return (
    <ModuleViewContainer
      entity={mass}
      entityType="Mass"
      modulePath="masses"
      mainEvent={mass.event}
      generateFilename={generateFilename}
      buildLiturgy={buildMassLiturgy}
      getTemplateId={getTemplateId}
      statusType="mass"
    />
  )
}
