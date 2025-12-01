import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { ModuleCreateButton } from '@/components/module-create-button'
import { getGroups, getGroupStats } from '@/lib/actions/groups'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { GroupsListClient } from './groups-list-client'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{
    search?: string
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

  // Build filters from URL params
  const filters = {
    search: params.search,
    sort: params.sort || 'name_asc'
  }

  // Fetch groups and stats server-side
  const [groups, stats] = await Promise.all([
    getGroups(filters),
    getGroupStats(filters)
  ])

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Groups" }
  ]

  return (
    <PageContainer
      title="Groups"
      description="Manage groups of people who serve together in liturgical ministries"
      primaryAction={<ModuleCreateButton moduleName="Group" href="/groups/create" />}
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <GroupsListClient initialData={groups} stats={stats} />
    </PageContainer>
  )
}
