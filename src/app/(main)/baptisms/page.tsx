import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { ModuleCreateButton } from '@/components/module-create-button'
import { getBaptisms, type BaptismFilterParams } from "@/lib/actions/baptisms"
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BaptismsListClient } from './baptisms-list-client'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ search?: string; status?: string }>
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
    status: params.status as BaptismFilterParams['status']
  }

  // Fetch baptisms server-side with filters
  const baptisms = await getBaptisms(filters)

  // Compute stats server-side
  const allBaptisms = await getBaptisms()
  const stats = {
    total: allBaptisms.length,
    filtered: baptisms.length,
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Our Baptisms" }
  ]

  return (
    <PageContainer
      title="Our Baptisms"
      description="Welcoming new members into the Body of Christ."
      actions={<ModuleCreateButton moduleName="Baptism" href="/baptisms/create" />}
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <BaptismsListClient initialData={baptisms} stats={stats} />
    </PageContainer>
  )
}
