"use client"

import { WeddingWithRelations } from '@/lib/actions/weddings'
import { ModuleViewContainer } from '@/components/module-view-container'
import { buildWeddingLiturgy } from '@/lib/content-builders/wedding'

interface WeddingViewClientProps {
  wedding: WeddingWithRelations
}

export function WeddingViewClient({ wedding }: WeddingViewClientProps) {
  // Generate filename for downloads
  const generateFilename = (extension: string) => {
    const brideLastName = wedding.bride?.last_name || 'Bride'
    const groomLastName = wedding.groom?.last_name || 'Groom'
    const weddingDate = wedding.wedding_event?.start_date
      ? new Date(wedding.wedding_event.start_date).toISOString().split('T')[0].replace(/-/g, '')
      : 'NoDate'
    return `${brideLastName}-${groomLastName}-${weddingDate}.${extension}`
  }

  // Extract template ID from wedding record
  const getTemplateId = (wedding: WeddingWithRelations) => {
    return wedding.wedding_template_id || 'wedding-full-script-english'
  }

  return (
    <ModuleViewContainer
      entity={wedding}
      entityType="Wedding"
      modulePath="weddings"
      mainEvent={wedding.wedding_event}
      generateFilename={generateFilename}
      buildLiturgy={buildWeddingLiturgy}
      getTemplateId={getTemplateId}
    />
  )
}
