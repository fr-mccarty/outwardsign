import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { ModuleCreateButton } from '@/components/module-create-button'
import { getAllParishEvents, getParishEventStats, type ParishEventFilterParams } from "@/lib/actions/parish-events"
import { getActiveEventTypes } from "@/lib/actions/event-types"
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EventsListClient } from './events-list-client'
import { LIST_VIEW_PAGE_SIZE } from '@/lib/constants'
import { getTranslations } from 'next-intl/server'
import { Settings } from 'lucide-react'

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
  const eventTypes = allEventTypes.filter(et => et.system_type === 'parish-event')

  // Look up event type ID from slug if event_type filter is provided
  const eventTypeId = params.event_type
    ? eventTypes.find(et => et.slug === params.event_type)?.id
    : undefined

  // Build filters from search params WITH DEFAULTS
  // Per LIST_VIEW_PATTERN.md: Apply defaults on server BEFORE calling server actions
  const filters: ParishEventFilterParams = {
    search: params.search,
    systemType: 'parish-event', // Filter only master_events with system_type = 'parish-event'
    status: (params.status as ParishEventFilterParams['status']) || 'ACTIVE', // Default applied
    eventTypeId,
    startDate: params.start_date,
    endDate: params.end_date,
    sort: (params.sort as ParishEventFilterParams['sort']) || 'date_asc', // Default to date ascending
    offset: 0,
    limit: LIST_VIEW_PAGE_SIZE
  }

  // Fetch master events and stats server-side
  const [events, stats] = await Promise.all([
    getAllParishEvents(filters),
    getParishEventStats(filters)
  ])

  const t = await getTranslations()

  const breadcrumbs = [
    { label: t('nav.dashboard'), href: "/dashboard" },
    { label: t('nav.ourEvents') }
  ]

  return (
    <PageContainer
      title={t('nav.ourEvents')}
      description="Organize parish gatherings, meetings, and special occasions."
      primaryAction={<ModuleCreateButton moduleName="Event" href="/events/create" />}
      additionalActions={[
        {
          type: 'action',
          label: t('events.manageEventTypes'),
          icon: <Settings className="h-4 w-4" />,
          href: '/settings/events'
        }
      ]}
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <EventsListClient initialData={events} stats={stats} eventTypes={eventTypes} />
    </PageContainer>
  )
}
