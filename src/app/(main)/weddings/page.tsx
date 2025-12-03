import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { ModuleCreateButton } from '@/components/module-create-button'
import { getWeddings, getWeddingStats, type WeddingFilterParams } from "@/lib/actions/weddings"
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { WeddingsListClient } from './weddings-list-client'
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

export default async function WeddingsPage({ searchParams }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const params = await searchParams

  // Build filters from search params with defaults
  const filters: WeddingFilterParams = {
    search: params.search,
    status: (params.status as WeddingFilterParams['status']) || 'ACTIVE',
    sort: (params.sort as WeddingFilterParams['sort']) || 'date_asc',
    page: params.page ? parseInt(params.page, 10) : 1,
    limit: LIST_VIEW_PAGE_SIZE,
    start_date: params.start_date,
    end_date: params.end_date
  }

  // Fetch weddings server-side with filters
  const weddings = await getWeddings(filters)

  // Calculate stats server-side
  const stats = await getWeddingStats(weddings)

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Our Weddings" }
  ]

  return (
    <PageContainer
      title="Our Weddings"
      description="Uniting couples in the bond of marriage before God."
      primaryAction={<ModuleCreateButton moduleName="Wedding" href="/weddings/create" />}
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <WeddingsListClient initialData={weddings} stats={stats} />
    </PageContainer>
  )
}
