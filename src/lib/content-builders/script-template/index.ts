/**
 * Script Template Content Builder
 *
 * Generates printable scripts for special liturgies using database script templates.
 * This builder expands placeholders in script sections using the content processor.
 *
 * System Types:
 * - 'mass': Uses simple-event-script builder (code-based)
 * - 'event': Uses simple-event-script builder (code-based)
 * - 'special-liturgy': Uses this builder (database template-based)
 *
 * NOTE: This builder is currently just a wrapper around the content processor
 * (processScriptForRendering). The print page directly uses processScriptForRendering
 * to generate HTML. This file exists to provide a content-builder interface for
 * consistency with other modules, but the actual work is done by the content processor.
 */

import { ParishEventWithRelations } from '@/lib/types'
import { ScriptWithSections } from '@/lib/types/event-types'
import { LiturgyDocument, ContentSection, TextElement } from '@/lib/types/liturgy-content'
import { processScriptSection } from '@/lib/utils/content-processor'

/**
 * Build liturgy document from script template
 *
 * This function generates a printable script by:
 * 1. Reading script sections in their defined order
 * 2. Expanding all {{placeholder}} patterns with event field values
 * 3. Converting markdown content to HTML (via markdown processor)
 * 4. Handling page breaks between sections
 *
 * @param event - Master event with relations (includes resolved_fields)
 * @param script - Script with sections (template from database)
 * @returns LiturgyDocument ready for rendering
 *
 * @example
 * const script = await getScriptWithSections(scriptId)
 * const doc = buildFromScriptTemplate(event, script)
 * // Returns a document with processed sections ready for rendering
 *
 * Note: For direct HTML rendering (like the print page), use processScriptForRendering()
 * from the markdown processor instead. This builder is for the LiturgyDocument format.
 */
export function buildFromScriptTemplate(
  event: ParishEventWithRelations,
  script: ScriptWithSections
): LiturgyDocument {
  // Validate inputs
  if (!event.resolved_fields) {
    throw new Error('Event must have resolved_fields')
  }
  if (!script.sections || script.sections.length === 0) {
    throw new Error('Script must have sections')
  }

  const sections: ContentSection[] = []

  // Sort sections by order
  const sortedSections = [...script.sections].sort((a, b) => a.order - b.order)

  // Process each section in order
  for (const section of sortedSections) {
    const elements: TextElement[] = []

    // Process section content - expand placeholders and convert markdown to HTML
    const processedHtml = processScriptSection(section.content, event)

    // Store the processed HTML as text (will be rendered as HTML by renderer)
    // Note: The renderer should handle this HTML content appropriately
    elements.push({
      type: 'text',
      text: processedHtml,
    })

    // Build section with page break control
    sections.push({
      id: section.id,
      title: section.name || undefined,
      pageBreakBefore: false,
      pageBreakAfter: section.page_break_after,
      elements,
    })
  }

  return {
    id: event.id,
    type: 'event',
    language: 'en', // Scripts support both languages via content
    template: `script-template-${script.id}`,
    title: script.name,
    subtitle: event.event_type.name,
    sections,
  }
}
