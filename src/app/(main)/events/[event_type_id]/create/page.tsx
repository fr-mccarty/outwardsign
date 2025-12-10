import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getEventTypeWithRelationsBySlug } from '@/lib/actions/event-types'
import { DynamicEventCreateClient } from './dynamic-event-create-client'

interface PageProps {
  params: Promise<{
    event_type_id: string  // This is actually the slug
  }>
}

export default async function CreateDynamicEventPage({ params }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { event_type_id: typeSlug } = await params

  // Fetch event type with relations by slug (input fields, scripts)
  const eventType = await getEventTypeWithRelationsBySlug(typeSlug)

  if (!eventType) {
    notFound()
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: eventType.name, href: `/events?type=${typeSlug}` },
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
