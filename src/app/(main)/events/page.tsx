import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { ModuleCreateButton } from '@/components/module-create-button'
import { getAllMasterEvents, getMasterEventStats, type MasterEventFilterParams } from "@/lib/actions/master-events"
import { getActiveEventTypes } from "@/lib/actions/event-types"
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EventsListClient } from './events-list-client'
import { LIST_VIEW_PAGE_SIZE } from '@/lib/constants'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{
    search?: string
    status?: string
    event_type?: string
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

  // Fetch event types first so we can look up by slug if needed
  const allEventTypes = await getActiveEventTypes()

  // Filter to only show 'event' system type event types for the dropdown
  const eventTypes = allEventTypes.filter(et => et.system_type === 'event')

  // Look up event type ID from slug if event_type filter is provided
  const eventTypeId = params.event_type
    ? eventTypes.find(et => et.slug === params.event_type)?.id
    : undefined

  // Build filters from search params WITH DEFAULTS
  // Per LIST_VIEW_PATTERN.md: Apply defaults on server BEFORE calling server actions
  const filters: MasterEventFilterParams = {
    search: params.search,
    systemType: 'event', // Filter only master_events with system_type = 'event'
    status: (params.status as MasterEventFilterParams['status']) || 'ACTIVE', // Default applied
    eventTypeId,
    startDate: params.start_date,
    endDate: params.end_date,
    sort: (params.sort as MasterEventFilterParams['sort']) || 'date_asc', // Default to date ascending
    offset: 0,
    limit: LIST_VIEW_PAGE_SIZE
  }

  // Fetch master events and stats server-side
  const [events, stats] = await Promise.all([
    getAllMasterEvents(filters),
    getMasterEventStats(filters)
  ])

  const t = await getTranslations()

  const breadcrumbs = [
    { label: t('nav.dashboard'), href: "/dashboard" },
    { label: t('nav.ourEvents') }
  ]

  return (
    <PageContainer
      title="Our Events"
      description="Organize parish gatherings, meetings, and special occasions."
      primaryAction={<ModuleCreateButton moduleName="Event" href="/events/create" />}
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <EventsListClient initialData={events} stats={stats} eventTypes={eventTypes} />
    </PageContainer>
  )
}
