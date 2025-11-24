import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { EventTypesListClient } from './event-types-list-client'
import { getEventTypes } from '@/lib/actions/event-types'

export default async function EventTypesPage() {
  const supabase = await createClient()

  // Check authentication server-side
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch all event types (including inactive)
  const eventTypes = await getEventTypes()

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Settings', href: '/settings' },
    { label: 'Event Types', href: '/settings/event-types' },
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <EventTypesListClient initialData={eventTypes} />
    </>
  )
}
