import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { getEventType } from '@/lib/actions/event-types'
import { getInputFieldDefinitions } from '@/lib/actions/input-field-definitions'
import { EventTypeFieldsClient } from './event-type-fields-client'

interface EventTypeFieldsPageProps {
  params: Promise<{ id: string }>
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
  const { id } = await params

  // Fetch event type and input fields
  const eventType = await getEventType(id)
  if (!eventType) {
    notFound()
  }

  const inputFields = await getInputFieldDefinitions(id)

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Settings', href: '/settings' },
    { label: 'Event Types', href: '/settings/event-types' },
    { label: eventType.name, href: `/settings/event-types/${id}` },
    { label: 'Input Fields', href: `/settings/event-types/${id}/fields` },
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <EventTypeFieldsClient eventType={eventType} initialFields={inputFields} />
    </>
  )
}
