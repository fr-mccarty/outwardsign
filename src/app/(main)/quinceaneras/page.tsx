import { Button } from "@/components/ui/button"
import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import Link from "next/link"
import { Plus } from "lucide-react"
import { getQuinceaneras, type QuinceaneraFilterParams } from "@/lib/actions/quinceaneras"
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { QuinceanerasListClient } from './quinceaneras-list-client'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ search?: string; status?: string }>
}

export default async function QuinceanerasPage({ searchParams }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const params = await searchParams

  // Build filters from search params
  const filters: QuinceaneraFilterParams = {
    search: params.search,
    status: params.status
  }

  // Fetch quinceaneras server-side with filters
  const quinceaneras = await getQuinceaneras(filters)

  // Compute stats server-side
  const allQuinceaneras = await getQuinceaneras()
  const stats = {
    total: allQuinceaneras.length,
    filtered: quinceaneras.length,
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Our Quinceañeras" }
  ]

  return (
    <PageContainer
      title="Our Quinceañeras"
      description="Manage quinceañera celebrations in your parish."
      maxWidth="7xl"
      actions={
        <Button asChild>
          <Link href="/quinceaneras/create">
            <Plus className="h-4 w-4 mr-2" />
            New Quinceañera
          </Link>
        </Button>
      }
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <QuinceanerasListClient initialData={quinceaneras} stats={stats} />
    </PageContainer>
  )
}
