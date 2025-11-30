import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { ModuleCreateButton } from '@/components/module-create-button'
import { getQuinceaneras, getQuinceaneraStats, type QuinceaneraFilterParams } from "@/lib/actions/quinceaneras"
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { QuinceanerasListClient } from './quinceaneras-list-client'
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

export default async function QuinceanerasPage({ searchParams }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const params = await searchParams

  // Build filters from search params
  const filters: QuinceaneraFilterParams = {
    search: params.search,
    status: params.status as QuinceaneraFilterParams['status'],
    sort: params.sort as QuinceaneraFilterParams['sort'],
    page: params.page ? parseInt(params.page, 10) : 1,
    limit: LIST_VIEW_PAGE_SIZE,
    start_date: params.start_date,
    end_date: params.end_date
  }

  // Fetch quinceaneras server-side with filters
  const quinceaneras = await getQuinceaneras(filters)

  // Calculate stats server-side
  const stats = await getQuinceaneraStats(quinceaneras)

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Our Quinceañeras" }
  ]

  return (
    <PageContainer
      title="Our Quinceañeras"
      description="A Latino tradition celebrating a young woman's 15th birthday and her faith journey."
      actions={<ModuleCreateButton moduleName="Quinceañera" href="/quinceaneras/create" />}
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <QuinceanerasListClient initialData={quinceaneras} stats={stats} />
    </PageContainer>
  )
}
