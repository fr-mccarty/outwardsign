import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { CalendarEventFormWrapper } from '../../calendar-event-form-wrapper'
import { getCalendarEventById } from "@/lib/actions/calendar-events"
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function CalendarEventEditPage({ params }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { id } = await params

  // Fetch calendar event
  const calendarEvent = await getCalendarEventById(id)
  if (!calendarEvent) {
    notFound()
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Calendar Events", href: "/calendar-events" },
    { label: calendarEvent.label, href: `/calendar-events/${id}` },
    { label: "Edit" }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <CalendarEventFormWrapper calendarEvent={calendarEvent} />
    </>
  )
}
