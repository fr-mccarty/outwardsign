import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getEventTypeBySlug, getEventTypes } from '@/lib/actions/event-types'
import { EventTypeSelector } from './event-type-selector'

interface PageProps {
  searchParams: Promise<{
    type?: string  // Event type slug - if provided, redirect directly to that create page
  }>
}

export default async function CreateEventPage({ searchParams }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const params = await searchParams

  // If type is provided in URL, redirect directly to the dynamic create page
  if (params.type) {
    const eventType = await getEventTypeBySlug(params.type)
    if (eventType) {
      redirect(`/events/${params.type}/create`)
    }
  }

  // Fetch all event types to display as options
  const eventTypes = await getEventTypes()

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Our Events", href: "/events" },
    { label: "Create" }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <EventTypeSelector eventTypes={eventTypes} />
    </>
  )
}
