/**
 * Text Export API Route for Mass Scripts
 *
 * Generates a plain text file from a Mass script with sections, replacing
 * {{Field Name}} placeholders with actual Mass data. Markdown is kept
 * as-is, and {red} tags are removed.
 *
 * Route: /api/mass-liturgies/[mass_id]/scripts/[script_id]/export/txt
 */

import { NextRequest, NextResponse } from 'next/server'
import { renderMarkdownToText } from '@/lib/utils/content-renderer'
import { getMassWithRelations } from '@/lib/actions/mass-liturgies'
import { getScriptWithSections } from '@/lib/actions/scripts'
import { getInputFieldDefinitions } from '@/lib/actions/input-field-definitions'

/**
 * GET handler for plain text export
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string; script_id: string }> }
) {
  try {
    const params = await context.params
    const { id: massId, script_id: scriptId } = params

    // Fetch mass with relations (server action handles auth)
    const mass = await getMassWithRelations(massId)
    if (!mass) {
      return NextResponse.json(
        { error: 'Mass not found' },
        { status: 404 }
      )
    }

    // Verify Mass has an event type
    if (!mass.event_type_id) {
      return NextResponse.json(
        { error: 'Mass does not have an event type' },
        { status: 400 }
      )
    }

    // Fetch script with sections (server action handles auth)
    const script = await getScriptWithSections(scriptId)
    if (!script) {
      return NextResponse.json(
        { error: 'Script not found' },
        { status: 404 }
      )
    }

    // Verify script belongs to mass's event type
    if (script.event_type_id !== mass.event_type_id) {
      return NextResponse.json(
        { error: 'Script does not belong to this Mass event type' },
        { status: 400 }
      )
    }

    // Fetch input field definitions (server action handles auth)
    const inputFieldDefinitions = await getInputFieldDefinitions(mass.event_type_id)

    // Build resolved entities from mass.resolved_fields
    const resolvedEntities = {
      people: {} as Record<string, any>,
      locations: {} as Record<string, any>,
      groups: {} as Record<string, any>,
      listItems: {} as Record<string, any>,
      documents: {} as Record<string, any>,
      contents: {} as Record<string, any>
    }

    // Populate resolvedEntities from mass.resolved_fields
    if (mass.resolved_fields) {
      for (const [, fieldData] of Object.entries(mass.resolved_fields)) {
        const typedFieldData = fieldData as { field_type: string; resolved_value: any; raw_value: any }
        if (typedFieldData.field_type === 'person' && typedFieldData.resolved_value) {
          resolvedEntities.people[typedFieldData.raw_value] = typedFieldData.resolved_value
        } else if (typedFieldData.field_type === 'location' && typedFieldData.resolved_value) {
          resolvedEntities.locations[typedFieldData.raw_value] = typedFieldData.resolved_value
        } else if (typedFieldData.field_type === 'group' && typedFieldData.resolved_value) {
          resolvedEntities.groups[typedFieldData.raw_value] = typedFieldData.resolved_value
        } else if (typedFieldData.field_type === 'content' && typedFieldData.resolved_value) {
          resolvedEntities.contents[typedFieldData.raw_value] = typedFieldData.resolved_value
        } else if (typedFieldData.field_type === 'list_item' && typedFieldData.resolved_value) {
          resolvedEntities.listItems[typedFieldData.raw_value] = typedFieldData.resolved_value
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
        fieldValues: mass.field_values || {},
        inputFieldDefinitions: inputFieldDefinitions || [],
        resolvedEntities,
        parish: mass.calendar_events?.[0]?.location ? {
          name: 'Parish', // TODO: Get actual parish name if needed
          city: mass.calendar_events[0].location.city || '',
          state: mass.calendar_events[0].location.state || ''
        } : undefined,
        format: 'text'
      })

      textOutput += sectionText.trim() + '\n\n'

      // Add page break indicator if requested
      if (section.page_break_after && i < sortedSections.length - 1) {
        textOutput += '\n--- PAGE BREAK ---\n\n'
      }
    }

    // Get filename from query params or generate default
    const url = new URL(request.url)
    const filename = url.searchParams.get('filename') || `Mass-${script.name}-${massId.substring(0, 8)}.txt`

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
