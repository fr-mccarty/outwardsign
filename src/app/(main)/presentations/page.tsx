import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { ModuleCreateButton } from '@/components/module-create-button'
import { getPresentations, getPresentationStats, type PresentationFilterParams } from "@/lib/actions/presentations"
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PresentationsListClient } from './presentations-list-client'
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

export default async function PresentationsPage({ searchParams }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const params = await searchParams

  // Build filters from search params
  const filters: PresentationFilterParams = {
    search: params.search,
    status: params.status as PresentationFilterParams['status'],
    sort: params.sort as PresentationFilterParams['sort'],
    page: params.page ? parseInt(params.page, 10) : 1,
    limit: LIST_VIEW_PAGE_SIZE,
    start_date: params.start_date,
    end_date: params.end_date
  }

  // Fetch presentations server-side with filters
  const presentations = await getPresentations(filters)

  // Calculate stats server-side
  const stats = await getPresentationStats(presentations)

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Our Presentations" }
  ]

  return (
    <PageContainer
      title="Our Presentations"
      description="A Latino tradition of presenting children to God, typically at age three."
      primaryAction={<ModuleCreateButton moduleName="Presentation" href="/presentations/create" />}
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <PresentationsListClient initialData={presentations} stats={stats} />
    </PageContainer>
  )
}
