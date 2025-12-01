import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { ModuleCreateButton } from '@/components/module-create-button'
import { getMassIntentions, getMassIntentionStats, type MassIntentionFilterParams } from "@/lib/actions/mass-intentions"
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MassIntentionsListClient } from './mass-intentions-list-client'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ search?: string; status?: string; sort?: string; start_date?: string; end_date?: string }>
}

export default async function MassIntentionsPage({ searchParams }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const params = await searchParams

  // Build filters from search params
  const filters: MassIntentionFilterParams = {
    search: params.search,
    status: params.status as MassIntentionFilterParams['status'],
    sort: params.sort as MassIntentionFilterParams['sort'],
    start_date: params.start_date,
    end_date: params.end_date
  }

  // Fetch mass intentions server-side with filters
  const intentions = await getMassIntentions(filters)

  // Compute stats server-side
  const allIntentions = await getMassIntentions()
  const stats = await getMassIntentionStats(allIntentions)

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Mass Intentions" }
  ]

  return (
    <PageContainer
      title="Mass Intentions"
      description="Manage Mass intentions for your parish."
      primaryAction={<ModuleCreateButton moduleName="Mass Intention" href="/mass-intentions/create" />}
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <MassIntentionsListClient initialData={intentions} stats={stats} />
    </PageContainer>
  )
}
