import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getEventWithRelations } from '@/lib/actions/dynamic-events'
import { getEventTypeBySlug } from '@/lib/actions/event-types'
import { DynamicEventViewClient } from './dynamic-event-view-client'

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

  // Fetch event type by slug
  const eventType = await getEventTypeBySlug(typeSlug)

  if (!eventType) {
    notFound()
  }

  // TODO: Build dynamic title from key person names once field resolution is implemented
  const title = eventType.name

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
      <DynamicEventViewClient event={event} eventType={eventType} />
    </PageContainer>
  )
}
