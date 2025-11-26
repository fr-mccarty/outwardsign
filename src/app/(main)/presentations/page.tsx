import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { ModuleCreateButton } from '@/components/module-create-button'
import { getPresentations, type PresentationFilterParams } from "@/lib/actions/presentations"
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PresentationsListClient } from './presentations-list-client'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ search?: string; status?: string }>
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
    status: params.status as PresentationFilterParams['status']
  }

  // Fetch presentations server-side with filters
  const presentations = await getPresentations(filters)

  // Compute stats server-side
  const allPresentations = await getPresentations()
  const stats = {
    total: allPresentations.length,
    filtered: presentations.length,
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Our Presentations" }
  ]

  return (
    <PageContainer
      title="Our Presentations"
      description="A Latino tradition of presenting children to God, typically at age three."
      actions={<ModuleCreateButton moduleName="Presentation" href="/presentations/create" />}
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <PresentationsListClient initialData={presentations} stats={stats} />
    </PageContainer>
  )
}
