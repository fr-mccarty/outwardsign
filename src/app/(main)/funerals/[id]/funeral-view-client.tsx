"use client"

import { FuneralWithRelations } from '@/lib/actions/funerals'
import { Card, CardContent } from '@/components/ui/card'
import { ModuleViewPanel } from '@/components/module-view-panel'
import { buildFuneralLiturgy } from '@/lib/content-builders/funeral'
import { renderHTML } from '@/lib/renderers/html-renderer'

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

  // Build liturgy content using centralized content builder
  // Use the template_id from the funeral record, defaulting to 'funeral-full-script-english'
  const templateId = funeral.funeral_template_id || 'funeral-full-script-english'
  const liturgyDocument = buildFuneralLiturgy(funeral, templateId)

  // Render to HTML
  const liturgyContent = renderHTML(liturgyDocument)

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Side Panel - appears first on mobile, second on desktop */}
      <ModuleViewPanel
        entity={funeral}
        entityType="Funeral"
        modulePath="funerals"
        mainEvent={funeral.funeral_event}
        generateFilename={generateFilename}
      />

      {/* Main Content - appears second on mobile, first on desktop */}
      <div className="flex-1 order-2 md:order-1">
        <Card>
          <CardContent className="p-6 space-y-6">
            {liturgyContent}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
