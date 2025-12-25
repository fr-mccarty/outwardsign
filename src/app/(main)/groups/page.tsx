import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { ModuleCreateButton } from '@/components/module-create-button'
import { getGroups, getGroupStats } from '@/lib/actions/groups'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { GroupsListClient } from './groups-list-client'
import { INFINITE_SCROLL_LOAD_MORE_SIZE } from '@/lib/constants'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{
    search?: string
    status?: string
    sort?: string
    page?: string
  }>
}

export default async function GroupsPage({ searchParams }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Await searchParams (Next.js 15 requirement)
  const params = await searchParams

  // Build filters from URL params WITH DEFAULTS
  // 🔴 CRITICAL: Apply defaults on server BEFORE calling server action
  const filters = {
    search: params.search,
    status: params.status || 'ACTIVE',  // Default applied
    sort: params.sort || 'name_asc'     // Default applied
  }

  // Fetch groups and stats server-side
  const [groups, stats] = await Promise.all([
    getGroups(filters),
    getGroupStats(filters)
  ])

  const t = await getTranslations()

  const breadcrumbs = [
    { label: t('nav.dashboard'), href: "/dashboard" },
    { label: t('nav.groups') }
  ]

  // Calculate if there are more items to load
  const initialHasMore = groups.length >= INFINITE_SCROLL_LOAD_MORE_SIZE

  return (
    <PageContainer
      title={t('nav.ourGroups')}
      description="Manage groups of people who serve together in liturgical ministries"
      primaryAction={<ModuleCreateButton moduleName="Group" href="/groups/create" />}
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <GroupsListClient initialData={groups} stats={stats} initialHasMore={initialHasMore} />
    </PageContainer>
  )
}
