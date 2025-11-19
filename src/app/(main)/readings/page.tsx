import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { ModuleCreateButton } from '@/components/module-create-button'
import { getReadings, type ReadingFilterParams } from "@/lib/actions/readings"
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ReadingsListClient } from './readings-list-client'

interface PageProps {
  searchParams: Promise<{ search?: string; language?: string; category?: string }>
}

export default async function ReadingsPage({ searchParams }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const params = await searchParams

  // Build filters from search params
  const filters: ReadingFilterParams = {
    search: params.search,
    language: params.language as ReadingFilterParams['language'],
    category: params.category as ReadingFilterParams['category']
  }

  // Fetch readings server-side with filters
  const readings = await getReadings(filters)

  // Compute stats server-side
  const allReadings = await getReadings()
  const languages = [...new Set(allReadings.map(r => r.language).filter(Boolean))] as string[]
  const categories = [...new Set(allReadings.flatMap(r => r.categories || []))]

  const stats = {
    total: allReadings.length,
    languageCount: languages.length,
    categoryCount: categories.length,
    filtered: readings.length,
    languages,
    categories
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Our Readings" }
  ]

  return (
    <PageContainer
      title="Our Readings"
      description="Manage your collection of scripture readings and liturgical texts."
      actions={<ModuleCreateButton moduleName="Reading" href="/readings/create" />}
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <ReadingsListClient initialData={readings} stats={stats} />
    </PageContainer>
  )
}
