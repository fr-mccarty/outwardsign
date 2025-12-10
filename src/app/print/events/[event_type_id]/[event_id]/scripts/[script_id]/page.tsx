/**
 * Print Page for User-Defined Event Scripts
 *
 * Server component that renders a script with replaced field values
 * optimized for printing or browser print dialog.
 *
 * Route: /print/events/[event_type_id]/[event_id]/scripts/[script_id]
 */

import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { renderMarkdownToHTML } from '@/lib/utils/markdown-renderer'

interface PageProps {
  params: Promise<{
    event_type_id: string
    event_id: string
    script_id: string
  }>
}

export default async function PrintScriptPage({ params }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { event_type_id, event_id, script_id } = await params

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
    notFound()
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
    notFound()
  }

  // Fetch input field definitions for the event type
  const { data: inputFieldDefinitions, error: fieldsError } = await supabase
    .from('input_field_definitions')
    .select('*')
    .eq('event_type_id', event_type_id)
    .order('order', { ascending: true })

  if (fieldsError) {
    notFound()
  }

  // Resolve entities referenced in field_values
  // This is a simplified version - a full implementation would fetch all referenced entities
  const resolvedEntities = {
    people: {},
    locations: {},
    groups: {},
    listItems: {},
    documents: {}
  }

  // Sort sections by order
  const sortedSections = (script.sections || []).sort((a: any, b: any) => a.order - b.order)

  // Render each section to HTML
  const renderedSections = await Promise.all(
    sortedSections.map(async (section: any) => {
      const html = await renderMarkdownToHTML(section.content, {
        fieldValues: event.field_values || {},
        inputFieldDefinitions: inputFieldDefinitions || [],
        resolvedEntities,
        format: 'html'
      })

      return {
        name: section.name,
        html,
        pageBreakAfter: section.page_break_after
      }
    })
  )

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @page {
          margin: 1in;
        }
        body {
          margin: 0 !important;
          background: white !important;
          color: black !important;
          font-family: 'Times New Roman', serif;
          font-size: 11pt;
          line-height: 1.4;
        }
        .print-container {
          max-width: none !important;
          box-shadow: none !important;
          border-radius: 0 !important;
          padding: 0 !important;
          background: white !important;
        }
        .section-title {
          font-size: 14pt;
          font-weight: bold;
          margin-top: 12pt;
          margin-bottom: 6pt;
        }
        .page-break {
          page-break-after: always;
        }
        /* Ensure red text stays red in print */
        span[style*="color: #c41e3a"],
        span[style*="color:#c41e3a"],
        span[style*="color: rgb(196, 30, 58)"] {
          color: #c41e3a !important;
        }
        /* Remove any default margins from HTML elements */
        h1, h2, h3, h4, h5, h6, p {
          margin: 0;
          padding: 0;
        }
        h1 {
          font-size: 18pt;
          font-weight: bold;
          margin-top: 12pt;
          margin-bottom: 6pt;
        }
        h2 {
          font-size: 16pt;
          font-weight: bold;
          margin-top: 10pt;
          margin-bottom: 5pt;
        }
        h3 {
          font-size: 14pt;
          font-weight: bold;
          margin-top: 8pt;
          margin-bottom: 4pt;
        }
        p {
          margin-bottom: 6pt;
        }
        ul, ol {
          margin-top: 3pt;
          margin-bottom: 6pt;
          padding-left: 20pt;
        }
        li {
          margin-bottom: 3pt;
        }
      `}} />
      <div className="print-container">
        {renderedSections.map((section, index) => (
          <div key={index} className={section.pageBreakAfter ? 'page-break' : ''}>
            {section.name && (
              <div className="section-title">{section.name}</div>
            )}
            <div dangerouslySetInnerHTML={{ __html: section.html }} />
          </div>
        ))}
      </div>
    </>
  )
}
