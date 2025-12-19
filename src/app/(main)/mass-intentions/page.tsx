import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { ModuleCreateButton } from '@/components/module-create-button'
import { getMassIntentions, getMassIntentionStats, type MassIntentionFilterParams } from "@/lib/actions/mass-intentions"
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MassIntentionsListClient } from './mass-intentions-list-client'
import { LIST_VIEW_PAGE_SIZE } from '@/lib/constants'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ search?: string; status?: string; sort?: string; start_date?: string; end_date?: string }>
}

export default async function MassIntentionsPage({ searchParams }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const params = await searchParams

  // Build filters from search params with defaults
  const filters: MassIntentionFilterParams = {
    search: params.search,
    status: params.status as MassIntentionFilterParams['status'],
    sort: (params.sort as MassIntentionFilterParams['sort']) || 'date_asc',
    offset: 0,
    limit: LIST_VIEW_PAGE_SIZE,
    start_date: params.start_date,
    end_date: params.end_date
  }

  // Fetch mass intentions server-side with filters
  const intentions = await getMassIntentions(filters)

  // Determine if there are more results
  const initialHasMore = intentions.length === LIST_VIEW_PAGE_SIZE

  // Compute stats server-side
  const allIntentions = await getMassIntentions()
  const stats = await getMassIntentionStats(allIntentions)

  const t = await getTranslations()

  const breadcrumbs = [
    { label: t('nav.dashboard'), href: "/dashboard" },
    { label: t('nav.massIntentions') }
  ]

  return (
    <PageContainer
      title="Mass Intentions"
      description="Manage Mass intentions for your parish."
      primaryAction={<ModuleCreateButton moduleName="Mass Intention" href="/mass-intentions/create" />}
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <MassIntentionsListClient initialData={intentions} stats={stats} initialHasMore={initialHasMore} />
    </PageContainer>
  )
}
