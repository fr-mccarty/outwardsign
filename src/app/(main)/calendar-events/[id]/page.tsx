import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { getCalendarEventById } from "@/lib/actions/calendar-events"
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { CalendarEventViewClient } from './calendar-event-view-client'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function CalendarEventViewPage({ params }: PageProps) {
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
    { label: calendarEvent.label }
  ]

  return (
    <PageContainer
      title={calendarEvent.label}
      description="Calendar event details"
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <CalendarEventViewClient calendarEvent={calendarEvent} />
    </PageContainer>
  )
}
