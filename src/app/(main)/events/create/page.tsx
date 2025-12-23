import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EventFormWrapper } from '../event-form-wrapper'
import { getLiturgicalCalendarEvent } from '@/lib/actions/liturgical-calendar'

interface PageProps {
  searchParams: Promise<{ liturgical_event_id?: string }>
}

export default async function CreateEventPage({ searchParams }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Read URL params (Next.js 15 requires awaiting searchParams)
  const params = await searchParams
  const liturgicalEventId = params.liturgical_event_id

  // Fetch liturgical event if ID is provided
  let initialLiturgicalEvent = null
  if (liturgicalEventId) {
    initialLiturgicalEvent = await getLiturgicalCalendarEvent(liturgicalEventId)
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Events", href: "/events" },
    { label: "Create" }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <EventFormWrapper
        title="Create Event"
        description="Add a new event to your parish."
        initialLiturgicalEvent={initialLiturgicalEvent}
      />
    </>
  )
}
