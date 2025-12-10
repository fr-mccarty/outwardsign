/**
 * Text Export API Route for User-Defined Event Scripts
 *
 * Generates a plain text file from a script with sections, replacing
 * {{Field Name}} placeholders with actual event data. Markdown is kept
 * as-is, and {red} tags are removed.
 *
 * Route: /api/events/[event_type_id]/[event_id]/scripts/[script_id]/export/txt
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { renderMarkdownToText } from '@/lib/utils/markdown-renderer'
import { resolveFieldEntities } from '@/lib/utils/resolve-field-entities'

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

    // Authenticate user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      redirect('/login')
    }

    // Fetch event with related data
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select(`
        *,
        event_type:event_types (
          id,
          name,
          icon
        )
      `)
      .eq('id', event_id)
      .single()

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Fetch script with sections
    const { data: script, error: scriptError } = await supabase
      .from('scripts')
      .select(`
        *,
        sections (
          id,
          name,
          content,
          page_break_after,
          order
        )
      `)
      .eq('id', script_id)
      .eq('event_type_id', event_type_id)
      .single()

    if (scriptError || !script) {
      return NextResponse.json(
        { error: 'Script not found' },
        { status: 404 }
      )
    }

    // Fetch input field definitions for the event type
    const { data: inputFieldDefinitions, error: fieldsError } = await supabase
      .from('input_field_definitions')
      .select('*')
      .eq('event_type_id', event_type_id)
      .order('order', { ascending: true })

    if (fieldsError) {
      return NextResponse.json(
        { error: 'Failed to fetch field definitions' },
        { status: 500 }
      )
    }

    // Resolve entities referenced in field_values (people, locations, groups, etc.)
    const resolvedEntities = await resolveFieldEntities(
      supabase,
      event.field_values || {},
      inputFieldDefinitions || []
    )

    // Build plain text output from sections
    let textOutput = ''

    // Sort sections by order
    const sortedSections = (script.sections || []).sort((a: any, b: any) => a.order - b.order)

    for (let i = 0; i < sortedSections.length; i++) {
      const section = sortedSections[i]

      // Add section title
      if (section.name) {
        textOutput += `${section.name}\n`
        textOutput += '='.repeat(section.name.length) + '\n\n'
      }

      // Convert section content (markdown) to plain text
      const sectionText = renderMarkdownToText(section.content, {
        fieldValues: event.field_values || {},
        inputFieldDefinitions: inputFieldDefinitions || [],
        resolvedEntities,
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
