import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { MassTimesListClient } from './mass-times-list-client'
import { getMassTimesPaginated } from '@/lib/actions/mass-times'

interface PageProps {
  searchParams: Promise<{
    search?: string
    is_active?: string
  }>
}

export default async function MassTimesPage({ searchParams }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Parse search params (Next.js 15 requires await)
  const params = await searchParams
  const filters = {
    search: params.search,
    is_active: params.is_active === 'true' ? true : params.is_active === 'false' ? false : undefined,
  }

  // Fetch mass times templates server-side with filters using paginated query
  const result = await getMassTimesPaginated({ ...filters, limit: 1000 })

  // Compute stats server-side
  const stats = {
    total: result.items.length,
    active: result.items.filter((mt) => mt.is_active).length,
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Mass Times Templates', href: '/mass-times' },
  ]

  return (
    <PageContainer
      title="Mass Times Templates"
      description="Manage mass times templates for different seasons and periods."
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <MassTimesListClient initialData={result.items} stats={stats} />
    </PageContainer>
  )
}
