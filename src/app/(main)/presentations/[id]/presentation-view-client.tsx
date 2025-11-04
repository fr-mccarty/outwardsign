"use client"

import { PresentationWithRelations } from '@/lib/actions/presentations'
import { Card, CardContent } from '@/components/ui/card'
import { ModuleViewPanel } from '@/components/module-view-panel'
import { buildPresentationLiturgy } from '@/lib/content-builders/presentation'
import { renderHTML } from '@/lib/renderers/html-renderer'

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

  // Build liturgy content using centralized content builder
  // Use the template_id from the presentation record, defaulting to 'presentation-spanish'
  const templateId = presentation.presentation_template_id || 'presentation-spanish'
  const liturgyDocument = buildPresentationLiturgy(presentation, templateId)

  // Render to HTML
  const liturgyContent = renderHTML(liturgyDocument)

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Side Panel - appears first on mobile, second on desktop */}
      <ModuleViewPanel
        entity={presentation}
        entityType="Presentation"
        modulePath="presentations"
        mainEvent={presentation.presentation_event}
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
