import { Button } from "@/components/ui/button"
import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import Link from "next/link"
import { Plus } from "lucide-react"
import { getWeddings, type WeddingFilterParams } from "@/lib/actions/weddings"
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { WeddingsListClient } from './weddings-list-client'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ search?: string; status?: string }>
}

export default async function WeddingsPage({ searchParams }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const params = await searchParams

  // Build filters from search params
  const filters: WeddingFilterParams = {
    search: params.search,
    status: params.status as WeddingFilterParams['status']
  }

  // Fetch weddings server-side with filters
  const weddings = await getWeddings(filters)

  // Compute stats server-side
  const allWeddings = await getWeddings()
  const stats = {
    total: allWeddings.length,
    filtered: weddings.length,
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Our Weddings" }
  ]

  return (
    <PageContainer
      title="Our Weddings"
      description="Manage wedding celebrations in your parish."
      actions={
        <Button asChild>
          <Link href="/weddings/create">
            <Plus className="h-4 w-4 mr-2" />
            New Wedding
          </Link>
        </Button>
      }
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <WeddingsListClient initialData={weddings} stats={stats} />
    </PageContainer>
  )
}
