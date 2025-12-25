'use client'

import { Card } from '@/components/content-card'
import type { ScriptWithSections } from '@/lib/types/event-types'
import type { MasterEventWithRelations } from '@/lib/types'
import { processScriptForRendering } from '@/lib/utils/content-processor'

interface DynamicScriptViewerProps {
  script: ScriptWithSections
  event: MasterEventWithRelations
}

/**
 * DynamicScriptViewer Component
 *
 * Renders a dynamic event script with field placeholders replaced by actual event data.
 * Renders HTML content with inline styles for formatting.
 *
 * Per requirements:
 * - Processes all sections in order
 * - Replaces {{Field Name}} placeholders with event data
 * - Renders HTML with inline styles (color, font-size, alignment, spacing)
 * - Shows page break indicators
 */
export function DynamicScriptViewer({ script, event }: DynamicScriptViewerProps) {
  // Process all sections
  const processedSections = processScriptForRendering(script, event)

  return (
    <Card className="p-8">
      <div className="space-y-6">
        {processedSections.map((section, index) => (
          <div key={section.id}>
            {/* Section heading */}
            {section.name && (
              <h2 className="text-xl font-bold mb-4 text-center">
                {section.name}
              </h2>
            )}

            {/* Section content with HTML from markdown */}
            <div
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: section.htmlContent }}
            />

            {/* Page break indicator (screen only - hidden in print/PDF/Word) */}
            {section.pageBreakAfter && index < processedSections.length - 1 && (
              <div className="my-8 border-t-2 border-dashed border-muted-foreground/50 print:hidden" />
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}
