import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { getEventTypeBySlug } from '@/lib/actions/event-types'
import { getInputFieldDefinitions } from '@/lib/actions/input-field-definitions'
import { EventTypeFieldsClient } from './event-type-fields-client'

interface EventTypeFieldsPageProps {
  params: Promise<{ slug: string }>
}

export default async function EventTypeFieldsPage({
  params,
}: EventTypeFieldsPageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Await params (Next.js 15 requirement)
  const { slug } = await params

  // Fetch event type by slug
  const eventType = await getEventTypeBySlug(slug)
  if (!eventType) {
    notFound()
  }

  // Fetch input fields using the event type ID
  const inputFields = await getInputFieldDefinitions(eventType.id)

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Settings', href: '/settings' },
    { label: 'Event Types', href: '/settings/event-types' },
    { label: eventType.name, href: `/settings/event-types/${eventType.slug}` },
    { label: 'Input Fields', href: `/settings/event-types/${eventType.slug}/fields` },
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <EventTypeFieldsClient eventType={eventType} initialFields={inputFields} />
    </>
  )
}
