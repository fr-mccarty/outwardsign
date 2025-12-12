import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getEventWithRelations } from '@/lib/actions/dynamic-events'
import { getScriptWithSections } from '@/lib/actions/scripts'
import { processScriptForRendering } from '@/lib/utils/markdown-processor'
import { PRINT_PAGE_STYLES } from '@/lib/print-styles'

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

  const { event_type_id: typeSlug, event_id, script_id } = await params

  // Fetch event with relations
  const event = await getEventWithRelations(event_id)
  if (!event) {
    notFound()
  }

  // Verify event belongs to correct event type slug
  if (event.event_type.slug !== typeSlug) {
    notFound()
  }

  // Fetch script with sections
  const script = await getScriptWithSections(script_id)
  if (!script) {
    notFound()
  }

  // Verify script belongs to event's event type
  if (script.event_type_id !== event.event_type_id) {
    notFound()
  }

  // Process all sections using shared markdown processor
  const processedSections = processScriptForRendering(script, event)

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PRINT_PAGE_STYLES }} />
      <div className="script-print-content">
        {/* Script Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-black">{script.name}</h1>
        </div>

        {/* Sections */}
        {processedSections.map((section) => (
          <div
            key={section.id}
            className={`reading-section ${section.pageBreakAfter ? 'page-break' : ''}`}
          >
            {section.name && (
              <div className="reading-title text-black">{section.name}</div>
            )}
            <div
              className="reading-text text-black prose max-w-none"
              dangerouslySetInnerHTML={{ __html: section.htmlContent }}
            />
          </div>
        ))}
      </div>
    </>
  )
}
