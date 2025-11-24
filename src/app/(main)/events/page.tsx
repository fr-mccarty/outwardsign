import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { ModuleCreateButton } from '@/components/module-create-button'
import { getEvents, getEventsWithModuleLinks, type EventFilterParams } from "@/lib/actions/events"
import { getEventTypes } from "@/lib/actions/event-types"
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EventsListClient } from './events-list-client'
import { RELATED_EVENT_TYPE_VALUES } from '@/lib/constants'

interface PageProps {
  searchParams: Promise<{
    search?: string
    event_type_id?: string
    related_event_type?: string
    language?: string
    start_date?: string
    end_date?: string
    sort?: string
  }>
}

export default async function EventsPage({ searchParams }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const params = await searchParams

  // Build filters from search params
  const filters: EventFilterParams = {
    search: params.search,
    event_type_id: params.event_type_id,
    related_event_type: params.related_event_type as EventFilterParams['related_event_type'],
    language: params.language as EventFilterParams['language'],
    start_date: params.start_date,
    end_date: params.end_date,
    sort: params.sort
  }

  // Fetch events server-side with filters and module links
  const events = await getEventsWithModuleLinks(filters)

  // Fetch event types for filter dropdown
  const eventTypes = await getEventTypes()

  // Compute stats server-side
  const allEvents = await getEvents()
  const languages = [...new Set(allEvents.map(e => e.language).filter(Boolean))] as string[]

  const now = new Date()
  const upcomingEvents = allEvents.filter(e => {
    if (!e.start_date) return false
    return new Date(e.start_date) >= now
  })

  const stats = {
    total: allEvents.length,
    upcoming: upcomingEvents.length,
    past: allEvents.length - upcomingEvents.length,
    filtered: events.length,
    eventTypes, // Now contains full EventType objects with id and name
    relatedEventTypes: Array.from(RELATED_EVENT_TYPE_VALUES), // System-defined types
    languages
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Our Events" }
  ]

  return (
    <PageContainer
      title="Our Events"
      description="Manage parish events and activities."
      actions={<ModuleCreateButton moduleName="Event" href="/events/create" />}
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <EventsListClient initialData={events} stats={stats} />
    </PageContainer>
  )
}
