import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { ModuleCreateButton } from '@/components/module-create-button'
import { getFamilies, getFamilyStats } from '@/lib/actions/families'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FamiliesListClient } from './families-list-client'
import { INFINITE_SCROLL_LOAD_MORE_SIZE } from '@/lib/constants'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{
    search?: string
    sort?: string
    active?: string
    page?: string
  }>
}

export default async function FamiliesPage({ searchParams }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Await searchParams (Next.js 15 requirement)
  const params = await searchParams

  // Build filters from URL params WITH DEFAULTS
  const filters = {
    search: params.search,
    sort: params.sort || 'name_asc',
    activeOnly: params.active === 'active' ? true : params.active === 'inactive' ? false : undefined
  }

  // Fetch families and stats server-side
  const [families, stats] = await Promise.all([
    getFamilies(filters),
    getFamilyStats(filters)
  ])

  const t = await getTranslations()

  const breadcrumbs = [
    { label: t('nav.dashboard'), href: "/dashboard" },
    { label: t('nav.families') }
  ]

  // Calculate if there are more items to load
  const initialHasMore = families.length >= INFINITE_SCROLL_LOAD_MORE_SIZE

  return (
    <PageContainer
      title="Families"
      description="Manage family relationships between parishioners"
      primaryAction={<ModuleCreateButton moduleName="Family" href="/families/create" />}
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <FamiliesListClient initialData={families} stats={stats} initialHasMore={initialHasMore} />
    </PageContainer>
  )
}
