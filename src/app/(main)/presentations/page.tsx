import { Button } from "@/components/ui/button"
import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import Link from "next/link"
import { Plus } from "lucide-react"
import { getPresentations, type PresentationFilterParams } from "@/lib/actions/presentations"
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PresentationsListClient } from './presentations-list-client'

interface PageProps {
  searchParams: Promise<{ search?: string; language?: string; child_sex?: string }>
}

export default async function PresentationsPage({ searchParams }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const params = await searchParams

  // Build filters from search params
  const filters: PresentationFilterParams = {
    search: params.search,
    language: params.language,
    child_sex: params.child_sex
  }

  // Fetch presentations server-side with filters
  const presentations = await getPresentations(filters)

  // Compute stats server-side
  const allPresentations = await getPresentations()
  const stats = {
    total: allPresentations.length,
    baptized: allPresentations.filter(p => p.is_baptized).length,
    unbaptized: allPresentations.filter(p => !p.is_baptized).length,
    filtered: presentations.length,
    englishCount: allPresentations.filter(p => p.language === 'English').length,
    spanishCount: allPresentations.filter(p => p.language === 'Spanish').length,
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Presentations" }
  ]

  return (
    <PageContainer
      title="Our Presentations"
      description="Manage child presentations in your parish."
      maxWidth="7xl"
      actions={
        <Button asChild>
          <Link href="/presentations/create">
            <Plus className="h-4 w-4 mr-2" />
            New Presentation
          </Link>
        </Button>
      }
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <PresentationsListClient initialData={presentations} stats={stats} />
    </PageContainer>
  )
}
