/**
 * Text Export API Route for User-Defined Event Scripts
 *
 * Generates a plain text file from a script with sections, replacing
 * {{Field Name}} placeholders with actual event data. Markdown is kept
 * as-is, and {red} tags are removed.
 *
 * Route: /api/events/[event_type_id]/[event_id]/scripts/[script_id]/export/txt
 * Note: event_type_id can be either a UUID or a slug
 */

import { NextRequest, NextResponse } from 'next/server'
import { renderMarkdownToText } from '@/lib/utils/markdown-renderer'
import { getEventWithRelations } from '@/lib/actions/dynamic-events'
import { getScriptWithSections } from '@/lib/actions/scripts'
import { getEventTypeBySlug } from '@/lib/actions/event-types'
import { getInputFieldDefinitions } from '@/lib/actions/input-field-definitions'

/**
 * GET handler for plain text export
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ event_type_id: string; event_id: string; script_id: string }> }
) {
  try {
    const params = await context.params
    const { event_type_id, event_id, script_id } = params

    // Fetch event type by slug (server action handles auth)
    const eventType = await getEventTypeBySlug(event_type_id)
    if (!eventType) {
      return NextResponse.json(
        { error: 'Event type not found' },
        { status: 404 }
      )
    }

    // Fetch event with relations (server action handles auth)
    const event = await getEventWithRelations(event_id)
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Verify event belongs to correct event type
    if (event.event_type_id !== eventType.id) {
      return NextResponse.json(
        { error: 'Event type mismatch' },
        { status: 400 }
      )
    }

    // Fetch script with sections (server action handles auth)
    const script = await getScriptWithSections(script_id)
    if (!script) {
      return NextResponse.json(
        { error: 'Script not found' },
        { status: 404 }
      )
    }

    // Verify script belongs to event's event type
    if (script.event_type_id !== eventType.id) {
      return NextResponse.json(
        { error: 'Script does not belong to this event type' },
        { status: 400 }
      )
    }

    // Fetch input field definitions (server action handles auth)
    const inputFieldDefinitions = await getInputFieldDefinitions(eventType.id)

    // Build resolved entities from event.resolved_fields
    const resolvedEntities = {
      people: {} as Record<string, any>,
      locations: {} as Record<string, any>,
      groups: {} as Record<string, any>,
      listItems: {} as Record<string, any>,
      documents: {} as Record<string, any>
    }

    // Populate resolvedEntities from event.resolved_fields
    if (event.resolved_fields) {
      for (const [, fieldData] of Object.entries(event.resolved_fields)) {
        const typedFieldData = fieldData as { field_type: string; resolved_value: any; raw_value: any }
        if (typedFieldData.field_type === 'person' && typedFieldData.resolved_value) {
          resolvedEntities.people[typedFieldData.raw_value] = typedFieldData.resolved_value
        } else if (typedFieldData.field_type === 'location' && typedFieldData.resolved_value) {
          resolvedEntities.locations[typedFieldData.raw_value] = typedFieldData.resolved_value
        } else if (typedFieldData.field_type === 'group' && typedFieldData.resolved_value) {
          resolvedEntities.groups[typedFieldData.raw_value] = typedFieldData.resolved_value
        }
      }
    }

    // Build plain text output from sections
    let textOutput = ''

    // Sort sections by order
    const sortedSections = (script.sections || []).sort((a: any, b: any) => a.order - b.order)

    for (let i = 0; i < sortedSections.length; i++) {
      const section = sortedSections[i]

      // Add section title - centered with underline
      if (section.name) {
        // Center the title (assuming ~70 char width for text files)
        const lineWidth = 70
        const padding = Math.max(0, Math.floor((lineWidth - section.name.length) / 2))
        const centeredTitle = ' '.repeat(padding) + section.name
        const centeredUnderline = ' '.repeat(padding) + '='.repeat(section.name.length)
        textOutput += `${centeredTitle}\n`
        textOutput += `${centeredUnderline}\n\n`
      }

      // Convert section content (markdown) to plain text
      const sectionText = renderMarkdownToText(section.content, {
        fieldValues: event.field_values || {},
        inputFieldDefinitions: inputFieldDefinitions || [],
        resolvedEntities,
        parish: event.parish,
        format: 'text'
      })

      textOutput += sectionText.trim() + '\n\n'

      // Add page break indicator if requested
      if (section.page_break_after && i < sortedSections.length - 1) {
        textOutput += '\n--- PAGE BREAK ---\n\n'
      }
    }

    // Generate filename
    const filename = `${event.event_type?.name || 'Event'}-${script.name}-${event_id.substring(0, 8)}.txt`

    // Return plain text
    return new NextResponse(textOutput, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
  } catch (error) {
    console.error('Error generating text export:', error)
    return NextResponse.json(
      { error: 'Failed to generate text export' },
      { status: 500 }
    )
  }
}
