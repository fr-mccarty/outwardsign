import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getEventWithRelations, computeMasterEventTitle } from '@/lib/actions/master-events'
import { getEventTypeWithRelationsBySlug } from '@/lib/actions/event-types'
import { getScripts } from '@/lib/actions/scripts'
import { DynamicEventViewClient } from '@/app/(main)/events/[event_type_id]/[id]/master-event-view-client'

interface PageProps {
  params: Promise<{
    event_type_slug: string
    id: string
  }>
}

export default async function ViewSpecialLiturgyPage({ params }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { event_type_slug, id } = await params

  // Fetch event with relations
  const event = await getEventWithRelations(id)

  if (!event) {
    notFound()
  }

  // Fetch event type by slug with relations (includes input_field_definitions and scripts)
  const eventType = await getEventTypeWithRelationsBySlug(event_type_slug)

  if (!eventType) {
    notFound()
  }

  // Validate that this event type is a special liturgy
  if (eventType.system_type !== 'special-liturgy') {
    notFound()
  }

  // Fetch scripts for this event type
  const scripts = await getScripts(event.event_type_id)

  // Build dynamic title from key person names
  const title = await computeMasterEventTitle(event)

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: eventType.name, href: `/special-liturgies/${event_type_slug}` },
    { label: title }
  ]

  return (
    <PageContainer
      title={title}
      description={`View ${eventType.name.toLowerCase()} details.`}
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <DynamicEventViewClient
        event={event}
        eventType={eventType}
        scripts={scripts}
        eventTypeSlug={event_type_slug}
      />
    </PageContainer>
  )
}
