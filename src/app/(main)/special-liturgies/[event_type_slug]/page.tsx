import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { ModuleCreateButton } from '@/components/module-create-button'
import { getEvents, type ParishEventFilterParams } from "@/lib/actions/parish-events"
import { getEventTypeBySlug } from '@/lib/actions/event-types'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { EventsListClient } from '@/app/(main)/events/[event_type_id]/events-list-client'
import { LIST_VIEW_PAGE_SIZE } from '@/lib/constants'
import { Settings } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{
    event_type_slug: string
  }>
  searchParams: Promise<{
    search?: string
    sort?: string
    start_date?: string
    end_date?: string
  }>
}

export default async function SpecialLiturgiesPage({ params, searchParams }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { event_type_slug } = await params
  const searchParamsResolved = await searchParams

  // Fetch event type by slug
  const eventType = await getEventTypeBySlug(event_type_slug)

  if (!eventType) {
    notFound()
  }

  // Validate that this event type is a special liturgy
  if (eventType.system_type !== 'special-liturgy') {
    notFound()
  }

  // Build filters from search params with defaults
  const filters: ParishEventFilterParams = {
    search: searchParamsResolved.search,
    sort: (searchParamsResolved.sort as ParishEventFilterParams['sort']) || 'date_desc',
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
      description={`Manage ${eventType.name.toLowerCase()} special liturgies.`}
      primaryAction={<ModuleCreateButton moduleName={eventType.name} href={`/special-liturgies/${event_type_slug}/create`} />}
      additionalActions={[
        {
          type: 'action',
          label: `Configure ${eventType.name}`,
          icon: <Settings className="h-4 w-4" />,
          href: `/settings/event-types/${event_type_slug}`
        }
      ]}
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <EventsListClient
        eventType={eventType}
        initialData={events}
        initialHasMore={initialHasMore}
        baseUrl={`/special-liturgies/${event_type_slug}`}
      />
    </PageContainer>
  )
}
