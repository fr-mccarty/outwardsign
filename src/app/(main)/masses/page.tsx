import { Button } from "@/components/ui/button"
import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import Link from "next/link"
import { Plus } from "lucide-react"
import { getMasses, type MassFilterParams } from "@/lib/actions/masses"
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MassesListClient } from './masses-list-client'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ search?: string; status?: string }>
}

export default async function MassesPage({ searchParams }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const params = await searchParams

  // Build filters from search params
  const filters: MassFilterParams = {
    search: params.search,
    status: params.status as MassFilterParams['status']
  }

  // Fetch masses server-side with filters
  const masses = await getMasses(filters)

  // Compute stats server-side
  const allMasses = await getMasses()
  const stats = {
    total: allMasses.length,
    filtered: masses.length,
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Masses" }
  ]

  return (
    <PageContainer
      title="Masses"
      description="Manage Mass celebrations in your parish."
      actions={
        <Button asChild>
          <Link href="/masses/create">
            <Plus className="h-4 w-4 mr-2" />
            New Mass
          </Link>
        </Button>
      }
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <MassesListClient initialData={masses} stats={stats} />
    </PageContainer>
  )
}
