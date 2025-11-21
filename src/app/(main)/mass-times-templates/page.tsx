import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { MassTimesListClient } from './mass-times-list-client'
import { getMassTimesPaginated } from '@/lib/actions/mass-times-templates'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'

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
    { label: 'Mass Times Templates', href: '/mass-times-templates' },
  ]

  return (
    <PageContainer
      title="Mass Times Templates"
      description="Manage mass times templates for different seasons and periods."
      actions={
        <Button asChild>
          <Link href="/mass-times-templates/create">
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Link>
        </Button>
      }
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <MassTimesListClient initialData={result.items} stats={stats} />
    </PageContainer>
  )
}
