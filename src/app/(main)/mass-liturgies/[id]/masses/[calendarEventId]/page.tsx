import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getEventWithRelations, computeParishEventTitle } from '@/lib/actions/parish-events'
import { getCalendarEventById } from '@/lib/actions/calendar-events'
import { getMassIntentionsByCalendarEvents } from '@/lib/actions/mass-intentions'
import { CalendarEventViewClient } from './calendar-event-view-client'
import { getTranslations } from 'next-intl/server'
import { formatDatePretty, formatTime } from '@/lib/utils/formatters'

interface PageProps {
  params: Promise<{ id: string; calendarEventId: string }>
}

export default async function ViewCalendarEventPage({ params }: PageProps) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { id, calendarEventId } = await params

  // Fetch the master event (mass-liturgy)
  const massLiturgy = await getEventWithRelations(id)
  if (!massLiturgy) {
    notFound()
  }

  // Fetch the specific calendar event
  const calendarEvent = await getCalendarEventById(calendarEventId)
  if (!calendarEvent || calendarEvent.master_event_id !== id) {
    notFound()
  }

  // Get the field definition for the calendar event name
  const fieldDefinition = massLiturgy.event_type?.input_field_definitions?.find(
    field => field.id === calendarEvent.input_field_definition_id
  )

  // Fetch intentions for this calendar event
  const intentionsMap = await getMassIntentionsByCalendarEvents([calendarEventId])
  const intentions = intentionsMap.get(calendarEventId) || []

  // Get assignments for this calendar event
  const assignments = massLiturgy.people_event_assignments?.filter(
    a => a.calendar_event_id === calendarEventId
  ) || []

  // Get occurrence-level person field definitions (for minister assignments)
  const occurrenceLevelPersonFields = massLiturgy.event_type?.input_field_definitions?.filter(
    field => field.type === 'person' && field.is_per_calendar_event
  ) || []

  // Build title
  const massLiturgyTitle = await computeParishEventTitle(massLiturgy)
  const calendarEventName = fieldDefinition?.name || 'Mass'
  const dateStr = calendarEvent.start_datetime
    ? formatDatePretty(new Date(calendarEvent.start_datetime))
    : ''
  const timeStr = calendarEvent.start_datetime
    ? formatTime(new Date(calendarEvent.start_datetime).toTimeString().slice(0, 8))
    : ''
  const title = `${calendarEventName} - ${dateStr}`

  const t = await getTranslations()

  const breadcrumbs = [
    { label: t('nav.dashboard'), href: "/dashboard" },
    { label: t('nav.ourMasses'), href: "/mass-liturgies" },
    { label: massLiturgyTitle, href: `/mass-liturgies/${id}` },
    { label: calendarEventName }
  ]

  return (
    <PageContainer
      title={title}
      description={`${timeStr}${calendarEvent.location ? ` at ${calendarEvent.location.name}` : ''}`}
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <CalendarEventViewClient
        massLiturgy={massLiturgy}
        calendarEvent={calendarEvent}
        intentions={intentions}
        assignments={assignments}
        occurrenceLevelPersonFields={occurrenceLevelPersonFields}
      />
    </PageContainer>
  )
}
