import { Button } from "@/components/ui/button"
import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { ModuleCreateButton } from '@/components/module-create-button'
import Link from "next/link"
import { Download } from "lucide-react"
import { getPeople, type PersonFilterParams } from "@/lib/actions/people"
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PeopleListClient } from './people-list-client'

interface PageProps {
  searchParams: Promise<{ search?: string }>
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
    search: params.search
  }

  // Fetch people server-side with filters
  const people = await getPeople(filters)

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
      actions={
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/api/people/csv">
              <Download className="h-4 w-4 mr-2" />
              Download CSV
            </Link>
          </Button>
          <ModuleCreateButton moduleName="Person" href="/people/create" />
        </div>
      }
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <PeopleListClient initialData={people} stats={stats} />
    </PageContainer>
  )
}
