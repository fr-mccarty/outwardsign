import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { ModuleCreateButton } from '@/components/module-create-button'
import { getFunerals, getFuneralStats, type FuneralFilterParams } from "@/lib/actions/funerals"
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FuneralsListClient } from './funerals-list-client'
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

export default async function FuneralsPage({ searchParams }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const params = await searchParams

  // Build filters from search params with defaults
  const filters: FuneralFilterParams = {
    search: params.search,
    status: (params.status as FuneralFilterParams['status']) || 'ACTIVE',
    sort: (params.sort as FuneralFilterParams['sort']) || 'date_asc',
    page: params.page ? parseInt(params.page, 10) : 1,
    limit: LIST_VIEW_PAGE_SIZE,
    start_date: params.start_date,
    end_date: params.end_date
  }

  // Fetch funerals server-side with filters
  const funerals = await getFunerals(filters)

  // Calculate stats server-side
  const stats = await getFuneralStats(funerals)

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Our Funerals" }
  ]

  return (
    <PageContainer
      title="Our Funerals"
      description="Commending the deceased to God's mercy."
      primaryAction={<ModuleCreateButton moduleName="Funeral" href="/funerals/create" />}
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <FuneralsListClient initialData={funerals} stats={stats} />
    </PageContainer>
  )
}
