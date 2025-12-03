import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { ModuleCreateButton } from '@/components/module-create-button'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { GroupBaptismsListClient } from './group-baptisms-list-client'
import { getGroupBaptisms, getGroupBaptismStats } from '@/lib/actions/group-baptisms'
import { LIST_VIEW_PAGE_SIZE } from '@/lib/constants'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{
    search?: string
    status?: string
    sort?: string
    page?: string
    start_date?: string
    end_date?: string
  }>
}

export default async function GroupBaptismsPage({ searchParams }: PageProps) {
  // 1. Authentication
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Parse search params (Next.js 15 requires await)
  const params = await searchParams
  const filters = {
    search: params.search,
    status: (params.status as any) || 'ACTIVE',
    sort: (params.sort as any) || 'date_asc',
    page: params.page ? parseInt(params.page) : 1,
    limit: LIST_VIEW_PAGE_SIZE,
    start_date: params.start_date,
    end_date: params.end_date
  }

  // 3. Fetch group baptisms server-side with filters
  const groupBaptisms = await getGroupBaptisms(filters)

  // 4. Compute stats server-side
  const stats = await getGroupBaptismStats(groupBaptisms)

  // 5. Define breadcrumbs
  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Our Group Baptisms' }
  ]

  return (
    <PageContainer
      title="Our Group Baptisms"
      description="Managing group baptism ceremonies with multiple families."
      primaryAction={<ModuleCreateButton moduleName="Group Baptism" href="/group-baptisms/create" />}
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <GroupBaptismsListClient initialData={groupBaptisms} stats={stats} />
    </PageContainer>
  )
}
