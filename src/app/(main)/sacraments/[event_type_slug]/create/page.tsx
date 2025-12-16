import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getEventTypeWithRelationsBySlug } from '@/lib/actions/event-types'
import { DynamicEventCreateClient } from '@/app/(main)/events/[event_type_id]/create/master-event-create-client'

interface PageProps {
  params: Promise<{
    event_type_slug: string
  }>
}

export default async function CreateSacramentPage({ params }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { event_type_slug } = await params

  // Fetch event type with relations by slug (input fields, scripts)
  const eventType = await getEventTypeWithRelationsBySlug(event_type_slug)

  if (!eventType) {
    notFound()
  }

  // Validate that this event type is a sacrament
  if (eventType.system_type !== 'sacrament') {
    notFound()
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: eventType.name, href: `/sacraments/${event_type_slug}` },
    { label: "Create" }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <DynamicEventCreateClient
        eventType={eventType}
        title={`Create ${eventType.name}`}
        description={`Add a new ${eventType.name.toLowerCase()} to your parish.`}
      />
    </>
  )
}
