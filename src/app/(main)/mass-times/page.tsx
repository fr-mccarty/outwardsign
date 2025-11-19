import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { MassTimesListClient } from './mass-times-list-client'
import { getMassTimesPaginated } from '@/lib/actions/mass-times'

interface PageProps {
  searchParams: Promise<{
    search?: string
    mass_type_id?: string
    language?: string
    active?: string
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
    mass_type_id: params.mass_type_id,
    language: params.language as any,
    active: params.active === 'true' ? true : params.active === 'false' ? false : undefined,
  }

  // Fetch mass times server-side with filters using paginated query to get relations
  const result = await getMassTimesPaginated({ ...filters, limit: 1000 })

  // Compute stats server-side
  const stats = {
    total: result.items.length,
    active: result.items.filter((mt) => mt.active).length,
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Mass Times', href: '/mass-times' },
  ]

  return (
    <PageContainer
      title="Mass Times"
      description="Manage recurring mass schedules for your parish."
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <MassTimesListClient initialData={result.items} stats={stats} />
    </PageContainer>
  )
}
