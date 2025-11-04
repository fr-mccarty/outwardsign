"use client"

import { WeddingWithRelations } from '@/lib/actions/weddings'
import { Card, CardContent } from '@/components/ui/card'
import { ModuleViewPanel } from '@/components/module-view-panel'
import { buildWeddingLiturgy } from '@/lib/content-builders/wedding'
import { renderHTML } from '@/lib/renderers/html-renderer'

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

  // Build liturgy content using centralized content builder
  // Use the template_id from the wedding record, defaulting to 'wedding-full-script-english'
  const templateId = wedding.wedding_template_id || 'wedding-full-script-english'
  const liturgyDocument = buildWeddingLiturgy(wedding, templateId)

  // Render to HTML
  const liturgyContent = renderHTML(liturgyDocument)

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Side Panel - appears first on mobile, second on desktop */}
      <ModuleViewPanel
        entity={wedding}
        entityType="Wedding"
        modulePath="weddings"
        mainEvent={wedding.wedding_event}
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
