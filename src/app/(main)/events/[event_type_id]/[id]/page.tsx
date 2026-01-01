import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getEventWithRelations } from '@/lib/actions/parish-events'
import { getEventTypeWithRelationsBySlug } from '@/lib/actions/event-types'
import { getScripts } from '@/lib/actions/scripts'
import { buildDynamicTitle } from '@/lib/utils/dynamic-title'
import { ParishEventViewClient } from './parish-event-view-client'

interface PageProps {
  params: Promise<{
    event_type_id: string  // This is actually the slug
    id: string
  }>
}

export default async function ViewDynamicEventPage({ params }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { event_type_id: typeSlug, id } = await params

  // Fetch event with relations
  const event = await getEventWithRelations(id)

  if (!event) {
    notFound()
  }

  // Fetch event type with relations by slug (includes input_field_definitions)
  const eventType = await getEventTypeWithRelationsBySlug(typeSlug)

  if (!eventType) {
    notFound()
  }

  // Redirect mass-liturgy and special-liturgy types to their dedicated modules
  if (eventType.system_type === 'mass-liturgy') {
    redirect(`/mass-liturgies/${id}`)
  }
  if (eventType.system_type === 'special-liturgy') {
    redirect(`/special-liturgies/${eventType.slug}/${id}`)
  }

  // Fetch scripts for this event type
  const scripts = await getScripts(event.event_type_id)

  // Build dynamic title from key person names (e.g., "Smith-Johnson Wedding")
  const title = buildDynamicTitle(event, eventType)

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: eventType.name, href: `/events?type=${typeSlug}` },
    { label: "View" }
  ]

  return (
    <PageContainer
      title={title}
      description={`View ${eventType.name.toLowerCase()} details.`}
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <ParishEventViewClient
        event={event}
        eventType={eventType}
        scripts={scripts}
        eventTypeSlug={typeSlug}
      />
    </PageContainer>
  )
}
