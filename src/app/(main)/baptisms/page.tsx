import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { ModuleCreateButton } from '@/components/module-create-button'
import { getBaptisms, getBaptismStats, type BaptismFilterParams } from "@/lib/actions/baptisms"
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BaptismsListClient } from './baptisms-list-client'
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

export default async function BaptismsPage({ searchParams }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const params = await searchParams

  // Build filters from search params
  const filters: BaptismFilterParams = {
    search: params.search,
    status: params.status as BaptismFilterParams['status'],
    sort: params.sort as BaptismFilterParams['sort'],
    page: params.page ? parseInt(params.page, 10) : 1,
    limit: LIST_VIEW_PAGE_SIZE,
    start_date: params.start_date,
    end_date: params.end_date
  }

  // Fetch baptisms server-side with filters
  const baptisms = await getBaptisms(filters)

  // Calculate stats server-side
  const stats = await getBaptismStats(baptisms)

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Our Baptisms" }
  ]

  return (
    <PageContainer
      title="Our Baptisms"
      description="Welcoming new members into the Body of Christ."
      primaryAction={<ModuleCreateButton moduleName="Baptism" href="/baptisms/create" />}
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <BaptismsListClient initialData={baptisms} stats={stats} />
    </PageContainer>
  )
}
