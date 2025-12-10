import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { ModuleCreateButton } from '@/components/module-create-button'
import { getEventsWithModuleLinks, getEventStats, type EventFilterParams, type EventWithRelations } from "@/lib/actions/events"
import { getEventTypeBySlug, getActiveEventTypes } from '@/lib/actions/event-types'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EventsListClient } from './events-list-client'
import { LIST_VIEW_PAGE_SIZE } from '@/lib/constants'

interface PageProps {
  searchParams: Promise<{
    search?: string
    type?: string  // Event type slug
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

  // If type param exists (slug), look up event_type_id
  let eventTypeId: string | undefined = params.event_type_id

  if (params.type) {
    const eventType = await getEventTypeBySlug(params.type)
    if (eventType) {
      eventTypeId = eventType.id
    }
  }

  // Build filters from search params with defaults
  const filters: EventFilterParams = {
    search: params.search,
    event_type_id: eventTypeId,
    related_event_type: params.related_event_type as EventFilterParams['related_event_type'],
    language: params.language as EventFilterParams['language'],
    start_date: params.start_date,
    end_date: params.end_date,
    sort: (params.sort as EventFilterParams['sort']) || 'date_asc',
    offset: 0,
    limit: LIST_VIEW_PAGE_SIZE
  }

  // Fetch events server-side with filters and module links
  const events = await getEventsWithModuleLinks(filters)

  // Determine if there are more results
  const initialHasMore = events.length === LIST_VIEW_PAGE_SIZE

  // Compute stats server-side (cast EventWithModuleLink[] to EventWithRelations[] for stats)
  const allEventsWithLinks = await getEventsWithModuleLinks()
  const allEvents = allEventsWithLinks as EventWithRelations[]
  const stats = await getEventStats(allEvents)

  // Fetch event types for filter dropdown
  const eventTypes = await getActiveEventTypes()

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Our Events" }
  ]

  return (
    <PageContainer
      title="Our Events"
      description="Manage parish events and activities."
      primaryAction={<ModuleCreateButton moduleName="Event" href="/events/create" />}
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <EventsListClient
        initialData={events}
        stats={stats}
        initialHasMore={initialHasMore}
        eventTypes={eventTypes}
      />
    </PageContainer>
  )
}
