"use client"

import { BaptismWithRelations } from '@/lib/actions/baptisms'
import { ModuleViewContainer } from '@/components/module-view-container'
import { buildBaptismLiturgy } from '@/lib/content-builders/baptism'

interface BaptismViewClientProps {
  baptism: BaptismWithRelations
}

export function BaptismViewClient({ baptism }: BaptismViewClientProps) {
  // Generate filename for downloads
  const generateFilename = (extension: string) => {
    const childLastName = baptism.child?.last_name || 'Child'
    const baptismDate = baptism.baptism_event?.start_date
      ? new Date(baptism.baptism_event.start_date).toISOString().split('T')[0].replace(/-/g, '')
      : 'NoDate'
    return `${childLastName}-Baptism-${baptismDate}.${extension}`
  }

  // Extract template ID from baptism record
  const getTemplateId = (baptism: BaptismWithRelations) => {
    return baptism.baptism_template_id || 'baptism-summary-english'
  }

  return (
    <ModuleViewContainer
      entity={baptism}
      entityType="Baptism"
      modulePath="baptisms"
      mainEvent={baptism.baptism_event}
      generateFilename={generateFilename}
      buildLiturgy={buildBaptismLiturgy}
      getTemplateId={getTemplateId}
    />
  )
}
