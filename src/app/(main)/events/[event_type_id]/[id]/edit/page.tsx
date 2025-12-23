import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getEventWithRelations } from '@/lib/actions/master-events'
import { getEventTypeWithRelationsBySlug } from '@/lib/actions/event-types'
import { DynamicEventEditClient } from './master-event-edit-client'

interface PageProps {
  params: Promise<{
    event_type_id: string  // This is actually the slug
    id: string
  }>
}

export default async function EditDynamicEventPage({ params }: PageProps) {
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

  // Fetch event type with relations by slug (input fields, scripts)
  const eventType = await getEventTypeWithRelationsBySlug(typeSlug)

  if (!eventType) {
    notFound()
  }

  // Redirect mass-liturgy and special-liturgy types to their dedicated modules
  if (eventType.system_type === 'mass-liturgy') {
    redirect(`/mass-liturgies/${id}/edit`)
  }
  if (eventType.system_type === 'special-liturgy') {
    redirect(`/special-liturgies/${eventType.slug}/${id}/edit`)
  }

  // TODO: Build dynamic title from key person names once field resolution is implemented
  const title = eventType.name

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: eventType.name, href: `/events?type=${typeSlug}` },
    { label: "Edit" }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <DynamicEventEditClient
        event={event}
        eventType={eventType}
        title={title}
        description={`Update ${eventType.name.toLowerCase()} information.`}
      />
    </>
  )
}
