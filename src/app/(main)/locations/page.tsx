import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { ModuleCreateButton } from '@/components/module-create-button'
import { getLocations, type LocationFilterParams } from "@/lib/actions/locations"
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LocationsListClient } from './locations-list-client'

interface PageProps {
  searchParams: Promise<{ search?: string }>
}

export default async function LocationsPage({ searchParams }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const params = await searchParams

  // Build filters from search params
  const filters: LocationFilterParams = {
    search: params.search,
  }

  // Fetch locations server-side with filters
  const locations = await getLocations(filters)

  // Compute stats server-side
  const allLocations = await getLocations()

  const stats = {
    total: allLocations.length,
    filtered: locations.length,
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Our Locations" }
  ]

  return (
    <PageContainer
      title="Locations"
      description="Manage parish locations."
      actions={<ModuleCreateButton moduleName="Location" href="/locations/create" />}
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <LocationsListClient initialData={locations} stats={stats} />
    </PageContainer>
  )
}
