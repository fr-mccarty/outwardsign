import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { ModuleCreateButton } from '@/components/module-create-button'
import { getAllMasterEvents, getMasterEventStats, type MasterEventFilterParams } from "@/lib/actions/master-events"
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MassLiturgiesListClient } from './mass-liturgies-list-client'
import { LIST_VIEW_PAGE_SIZE } from '@/lib/constants'
import { getTranslations } from 'next-intl/server'
import { Settings } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{
    search?: string
    status?: string
    start_date?: string
    end_date?: string
    sort?: string
  }>
}

export default async function MassesPage({ searchParams }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const params = await searchParams

  // Build filters from search params WITH DEFAULTS
  // Per LIST_VIEW_PATTERN.md: Apply defaults on server BEFORE calling server actions
  const filters: MasterEventFilterParams = {
    search: params.search,
    systemType: 'mass-liturgy', // Filter only master_events with system_type = 'mass-liturgy'
    status: (params.status as MasterEventFilterParams['status']) || 'ACTIVE', // Default applied
    startDate: params.start_date,
    endDate: params.end_date,
    sort: (params.sort as MasterEventFilterParams['sort']) || 'date_asc', // Default to date ascending
    offset: 0,
    limit: LIST_VIEW_PAGE_SIZE
  }

  // Fetch master events (masses) and stats server-side with filters
  const masses = await getAllMasterEvents(filters)
  const stats = await getMasterEventStats(filters)

  const t = await getTranslations()

  const breadcrumbs = [
    { label: t('nav.dashboard'), href: "/dashboard" },
    { label: t('nav.ourMasses') }
  ]

  return (
    <PageContainer
      title="Our Masses"
      description="Celebrate the Eucharist and gather the community in worship."
      primaryAction={<ModuleCreateButton moduleName="Mass" href="/mass-liturgies/create" />}
      additionalActions={[
        {
          type: 'action',
          label: 'Configure Mass Types',
          icon: <Settings className="h-4 w-4" />,
          href: '/settings/mass-liturgies'
        }
      ]}
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <MassLiturgiesListClient initialData={masses} stats={stats} />
    </PageContainer>
  )
}
