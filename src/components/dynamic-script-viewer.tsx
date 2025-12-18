'use client'

import { Card } from '@/components/ui/card'
import type { ScriptWithSections } from '@/lib/types/event-types'
import type { MasterEventWithRelations } from '@/lib/types'
import { processScriptForRendering } from '@/lib/utils/markdown-processor'

interface DynamicScriptViewerProps {
  script: ScriptWithSections
  event: MasterEventWithRelations
}

/**
 * DynamicScriptViewer Component
 *
 * Renders a dynamic event script with field placeholders replaced by actual event data.
 * Converts markdown content to HTML and applies liturgical styling.
 *
 * Per requirements:
 * - Processes all sections in order
 * - Replaces {{Field Name}} placeholders with event data
 * - Parses markdown to HTML with custom {red}{/red} syntax
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

            {/* Page break indicator (visual only, not printed) */}
            {section.pageBreakAfter && index < processedSections.length - 1 && (
              <div className="my-8 border-t-2 border-dashed border-muted-foreground/20 print:hidden" />
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}
