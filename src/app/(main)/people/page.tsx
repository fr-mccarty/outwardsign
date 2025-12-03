import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { ModuleCreateButton } from '@/components/module-create-button'
import { Download } from "lucide-react"
import { getPeople, type PersonFilterParams } from "@/lib/actions/people"
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PeopleListClient } from './people-list-client'
import { LIST_VIEW_PAGE_SIZE } from '@/lib/constants'

interface PageProps {
  searchParams: Promise<{
    search?: string
    sort?: string
  }>
}

export default async function PeoplePage({ searchParams }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const params = await searchParams

  // Build filters from search params
  const filters: PersonFilterParams = {
    search: params.search,
    sort: (params.sort as PersonFilterParams['sort']) || 'name_asc',
    offset: 0, // Always fetch first page on server
    limit: LIST_VIEW_PAGE_SIZE
  }

  // Fetch people server-side with filters
  const people = await getPeople(filters)

  // Determine if there are more results
  const initialHasMore = people.length === LIST_VIEW_PAGE_SIZE

  // Compute stats server-side
  const allPeople = await getPeople()
  const stats = {
    total: allPeople.length,
    withEmail: allPeople.filter(p => p.email).length,
    withPhone: allPeople.filter(p => p.phone_number).length,
    filtered: people.length
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Our People" }
  ]

  return (
    <PageContainer
      title="Our People"
      description="Manage people in your parish."
      primaryAction={<ModuleCreateButton moduleName="Person" href="/people/create" />}
      additionalActions={[
        {
          type: 'action',
          label: 'Download CSV',
          icon: <Download className="h-4 w-4" />,
          href: '/api/people/csv'
        }
      ]}
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <PeopleListClient initialData={people} stats={stats} initialHasMore={initialHasMore} />
    </PageContainer>
  )
}
