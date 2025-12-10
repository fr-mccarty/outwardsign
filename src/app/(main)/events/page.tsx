import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { ModuleCreateButton } from '@/components/module-create-button'
import { getAllDynamicEvents, type DynamicEventFilterParams } from "@/lib/actions/dynamic-events"
import { getEventTypeBySlug, getActiveEventTypes } from '@/lib/actions/event-types'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EventsListClient } from './events-list-client'
import { LIST_VIEW_PAGE_SIZE } from '@/lib/constants'

interface PageProps {
  searchParams: Promise<{
    search?: string
    type?: string  // Event type slug
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
  let eventTypeId: string | undefined

  if (params.type) {
    const eventType = await getEventTypeBySlug(params.type)
    if (eventType) {
      eventTypeId = eventType.id
    }
  }

  // Build filters from search params with defaults
  const filters: DynamicEventFilterParams = {
    search: params.search,
    eventTypeId,
    startDate: params.start_date,
    endDate: params.end_date,
    sort: (params.sort as DynamicEventFilterParams['sort']) || 'date_desc',
    offset: 0,
    limit: LIST_VIEW_PAGE_SIZE
  }

  // Fetch dynamic events server-side with filters
  const events = await getAllDynamicEvents(filters)

  // Determine if there are more results
  const initialHasMore = events.length === LIST_VIEW_PAGE_SIZE

  // Fetch event types for filter dropdown
  const eventTypes = await getActiveEventTypes()

  // Determine create URL - if filtering by type, go directly to that type's create page
  const createHref = params.type ? `/events/${params.type}/create` : '/events/create'

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Our Events" }
  ]

  return (
    <PageContainer
      title="Our Events"
      description="Manage parish events and activities."
      primaryAction={<ModuleCreateButton moduleName="Event" href={createHref} />}
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <EventsListClient
        initialData={events}
        initialHasMore={initialHasMore}
        eventTypes={eventTypes}
      />
    </PageContainer>
  )
}
