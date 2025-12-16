import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { ModuleCreateButton } from '@/components/module-create-button'
import { getEvents, type MasterEventFilterParams } from "@/lib/actions/master-events"
import { getEventTypeBySlug } from '@/lib/actions/event-types'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { EventsListClient } from './events-list-client'
import { LIST_VIEW_PAGE_SIZE } from '@/lib/constants'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{
    event_type_id: string  // This is actually the slug
  }>
  searchParams: Promise<{
    search?: string
    sort?: string
    start_date?: string
    end_date?: string
  }>
}

export default async function DynamicEventsPage({ params, searchParams }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { event_type_id: typeSlug } = await params
  const searchParamsResolved = await searchParams

  // Fetch event type by slug
  const eventType = await getEventTypeBySlug(typeSlug)

  if (!eventType) {
    notFound()
  }

  // Build filters from search params with defaults
  const filters: MasterEventFilterParams = {
    search: searchParamsResolved.search,
    sort: (searchParamsResolved.sort as MasterEventFilterParams['sort']) || 'date_desc',
    offset: 0, // Always fetch first page on server
    limit: LIST_VIEW_PAGE_SIZE,
    startDate: searchParamsResolved.start_date,
    endDate: searchParamsResolved.end_date
  }

  // Fetch events server-side with filters (use eventType.id for database query)
  const events = await getEvents(eventType.id, filters)

  // Determine if there are more results
  const initialHasMore = events.length === LIST_VIEW_PAGE_SIZE

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: eventType.name }
  ]

  return (
    <PageContainer
      title={`Our ${eventType.name}s`}
      description={`Manage ${eventType.name.toLowerCase()} events.`}
      primaryAction={<ModuleCreateButton moduleName={eventType.name} href={`/events/${typeSlug}/create`} />}
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <EventsListClient
        eventType={eventType}
        initialData={events}
        initialHasMore={initialHasMore}
      />
    </PageContainer>
  )
}
