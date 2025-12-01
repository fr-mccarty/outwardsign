import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { ModuleCreateButton } from '@/components/module-create-button'
import { getEventsWithModuleLinks, getEventStats, type EventFilterParams, type EventWithRelations } from "@/lib/actions/events"
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EventsListClient } from './events-list-client'

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
    sort: params.sort as EventFilterParams['sort']
  }

  // Fetch events server-side with filters and module links
  const events = await getEventsWithModuleLinks(filters)

  // Compute stats server-side (cast EventWithModuleLink[] to EventWithRelations[] for stats)
  const allEventsWithLinks = await getEventsWithModuleLinks()
  const allEvents = allEventsWithLinks as EventWithRelations[]
  const stats = await getEventStats(allEvents)

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
      <EventsListClient initialData={events} stats={stats} />
    </PageContainer>
  )
}
