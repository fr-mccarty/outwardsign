import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getEventWithRelations } from '@/lib/actions/master-events'
import { getEventTypeWithRelationsBySlug } from '@/lib/actions/event-types'
import { DynamicEventEditClient } from '@/app/(main)/events/[event_type_id]/[id]/edit/master-event-edit-client'

interface PageProps {
  params: Promise<{
    event_type_slug: string
    id: string
  }>
}

export default async function EditSacramentPage({ params }: PageProps) {
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

  // Fetch event type with relations by slug (input fields, scripts)
  const eventType = await getEventTypeWithRelationsBySlug(event_type_slug)

  if (!eventType) {
    notFound()
  }

  // Validate that this event type is a sacrament
  if (eventType.system_type !== 'sacrament') {
    notFound()
  }

  const title = eventType.name

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: eventType.name, href: `/sacraments/${event_type_slug}` },
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
