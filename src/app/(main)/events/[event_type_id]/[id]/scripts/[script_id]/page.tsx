import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getEventWithRelations } from '@/lib/actions/master-events'
import { getScriptWithSections } from '@/lib/actions/scripts'
import { ScriptViewClient } from './script-view-client'

interface PageProps {
  params: Promise<{
    event_type_id: string  // This is actually the slug
    id: string             // Event ID
    script_id: string      // Script ID
  }>
}

/**
 * Script View Page
 *
 * Server component that displays a dynamic event script with export options.
 *
 * Per requirements:
 * - Authenticate user
 * - Fetch event with relations
 * - Verify event belongs to correct event type slug
 * - Fetch script with sections
 * - Verify script belongs to event's event type
 * - Set breadcrumbs
 * - Pass data to client component
 */
export default async function ViewScriptPage({ params }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { event_type_id: typeSlug, id: eventId, script_id } = await params

  // Fetch event with relations
  const event = await getEventWithRelations(eventId)

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

  // Set breadcrumbs
  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: event.event_type.name, href: `/events?type=${typeSlug}` },
    { label: "Event", href: `/events/${typeSlug}/${eventId}` },
    { label: script.name }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <ScriptViewClient
        event={event}
        script={script}
        eventTypeSlug={typeSlug}
      />
    </>
  )
}
