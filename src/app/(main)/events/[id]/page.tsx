import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { getEventWithRelations } from "@/lib/actions/events"
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { RELATED_EVENT_TYPE_LABELS } from "@/lib/constants"
import { EventViewClient } from './event-view-client'
import { getEventModuleReference } from '@/lib/helpers/event-helpers'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EventDetailPage({ params }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { id } = await params

  // Fetch event server-side with relations
  const event = await getEventWithRelations(id)

  if (!event) {
    notFound()
  }

  // Fetch module reference if this event is linked to a module
  const moduleReference = await getEventModuleReference(event)

  // Determine event type label: use related_event_type (system-defined) or event_type entity (user-defined)
  const eventTypeDescription = event.related_event_type
    ? (RELATED_EVENT_TYPE_LABELS[event.related_event_type]?.en || event.related_event_type)
    : (event.event_type?.name || 'Event')

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Our Events", href: "/events" },
    { label: event.name }
  ]

  return (
    <PageContainer
      title={event.name}
      description={eventTypeDescription}
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <EventViewClient event={event} moduleReference={moduleReference} />
    </PageContainer>
  )
}
