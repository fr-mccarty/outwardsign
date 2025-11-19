import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { ModuleCreateButton } from '@/components/module-create-button'
import { getFunerals, type FuneralFilterParams } from "@/lib/actions/funerals"
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FuneralsListClient } from './funerals-list-client'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ search?: string; status?: string }>
}

export default async function FuneralsPage({ searchParams }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const params = await searchParams

  // Build filters from search params
  const filters: FuneralFilterParams = {
    search: params.search,
    status: params.status as FuneralFilterParams['status']
  }

  // Fetch funerals server-side with filters
  const funerals = await getFunerals(filters)

  // Compute stats server-side
  const allFunerals = await getFunerals()
  const stats = {
    total: allFunerals.length,
    filtered: funerals.length,
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Our Funerals" }
  ]

  return (
    <PageContainer
      title="Funerals"
      description="Manage funeral services in your parish."
      actions={<ModuleCreateButton moduleName="Funeral" href="/funerals/create" />}
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <FuneralsListClient initialData={funerals} stats={stats} />
    </PageContainer>
  )
}
