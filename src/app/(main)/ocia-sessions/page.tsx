import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { ModuleCreateButton } from '@/components/module-create-button'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { OciaSessionsListClient } from './ocia-sessions-list-client'
import { getOciaSessions, getOciaSessionStats } from '@/lib/actions/ocia-sessions'
import { LIST_VIEW_PAGE_SIZE } from '@/lib/constants'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function OciaSessionsPage({ searchParams }: PageProps) {
  // 1. Authentication
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Parse search params (Next.js 15 requires await)
  const params = await searchParams
  const filters = {
    search: params.search as string | undefined,
    status: (params.status as any) || 'ACTIVE',
    sort: (params.sort as any) || 'date_asc',
    offset: 0,
    limit: LIST_VIEW_PAGE_SIZE,
    start_date: params.start_date as string | undefined,
    end_date: params.end_date as string | undefined
  }

  // 3. Fetch OCIA sessions server-side with filters
  const ociaSessions = await getOciaSessions(filters)

  // Determine if there are more results
  const initialHasMore = ociaSessions.length === LIST_VIEW_PAGE_SIZE

  // 4. Compute stats server-side
  const stats = await getOciaSessionStats(ociaSessions)

  // 5. Define breadcrumbs
  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Our OCIA Sessions' }
  ]

  return (
    <PageContainer
      title="Our OCIA Sessions"
      description="Managing OCIA (Order of Christian Initiation of Adults) sessions and candidates."
      primaryAction={<ModuleCreateButton moduleName="OCIA Session" href="/ocia-sessions/create" />}
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <OciaSessionsListClient initialData={ociaSessions} stats={stats} initialHasMore={initialHasMore} />
    </PageContainer>
  )
}
