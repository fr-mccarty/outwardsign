"use client"

import { QuinceaneraWithRelations } from '@/lib/actions/quinceaneras'
import { Card, CardContent } from '@/components/ui/card'
import { ModuleViewPanel } from '@/components/module-view-panel'
import { buildQuinceaneraLiturgy } from '@/lib/content-builders/quinceanera'
import { renderHTML } from '@/lib/renderers/html-renderer'

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

  // Build liturgy content using centralized content builder
  // Use the template_id from the quinceanera record, defaulting to 'quinceanera-full-script-english'
  const templateId = quinceanera.quinceanera_template_id || 'quinceanera-full-script-english'
  const liturgyDocument = buildQuinceaneraLiturgy(quinceanera, templateId)

  // Render to HTML
  const liturgyContent = renderHTML(liturgyDocument)

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Side Panel - appears first on mobile, second on desktop */}
      <ModuleViewPanel
        entity={quinceanera}
        entityType="Quinceañera"
        modulePath="quinceaneras"
        mainEvent={quinceanera.quinceanera_event}
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
