import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { ModuleCreateButton } from '@/components/module-create-button'
import { Button } from '@/components/ui/button'
import { getMasses, type MassFilterParams } from "@/lib/actions/masses"
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MassesListClient } from './masses-list-client'
import { CalendarClock } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{
    search?: string
    status?: string
    start_date?: string
    end_date?: string
    sort?: string
    page?: string
    limit?: string
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

  // Get current date for default start_date filter
  const today = new Date().toISOString().split('T')[0]

  // Build filters from search params
  const filters: MassFilterParams = {
    search: params.search,
    status: params.status as MassFilterParams['status'],
    start_date: params.start_date || today, // Default to today
    end_date: params.end_date,
    sort: (params.sort as MassFilterParams['sort']) || 'date_asc', // Default to date ascending (chronological)
    page: params.page ? parseInt(params.page) : 1,
    limit: params.limit ? parseInt(params.limit) : 50
  }

  // Fetch masses server-side with filters
  const masses = await getMasses(filters)

  // Compute stats server-side
  const allMasses = await getMasses({ limit: 10000 }) // Get all for count
  const stats = {
    total: allMasses.length,
    filtered: masses.length,
  }

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
      description="Manage Mass celebrations in your parish."
      actions={
        <div className="flex gap-2">
          {canSchedule && (
            <Button asChild variant="outline">
              <Link href="/masses/schedule">
                <CalendarClock className="h-4 w-4 mr-2" />
                Schedule Masses
              </Link>
            </Button>
          )}
          <ModuleCreateButton moduleName="Mass" href="/masses/create" />
        </div>
      }
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <MassesListClient initialData={masses} stats={stats} />
    </PageContainer>
  )
}
