import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { ModuleCreateButton } from '@/components/module-create-button'
import { Button } from '@/components/ui/button'
import { getMasses, getMassStats, type MassFilterParams } from "@/lib/actions/masses"
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MassesListClient } from './masses-list-client'
import { CalendarClock } from 'lucide-react'
import Link from 'next/link'
import { LIST_VIEW_PAGE_SIZE } from '@/lib/constants'

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

  // Build filters from search params
  const filters: MassFilterParams = {
    search: params.search,
    status: params.status as MassFilterParams['status'],
    start_date: params.start_date,
    end_date: params.end_date,
    sort: (params.sort as MassFilterParams['sort']) || 'date_asc', // Default to date ascending (chronological)
    offset: 0,
    limit: LIST_VIEW_PAGE_SIZE
  }

  // Fetch masses and stats server-side with filters
  const masses = await getMasses(filters)
  const initialHasMore = masses.length === LIST_VIEW_PAGE_SIZE
  const stats = await getMassStats(filters)

  // Get user role for schedule button permission
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const canSchedule = profile && (profile.role === 'ADMIN' || profile.role === 'STAFF')

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Masses" }
  ]

  return (
    <PageContainer
      title="Masses"
      description="The source and summit of Catholic life."
      primaryAction={<ModuleCreateButton moduleName="Mass" href="/masses/create" />}
      additionalActions={canSchedule ? [
        {
          type: 'action',
          label: 'Schedule Masses',
          icon: <CalendarClock className="h-4 w-4" />,
          href: '/masses/schedule'
        }
      ] : undefined}
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <MassesListClient initialData={masses} stats={stats} initialHasMore={initialHasMore} />
    </PageContainer>
  )
}
