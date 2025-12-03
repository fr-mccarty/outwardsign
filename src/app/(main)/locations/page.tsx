import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { ModuleCreateButton } from '@/components/module-create-button'
import { getLocations, getLocationStats, type LocationFilterParams } from "@/lib/actions/locations"
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LocationsListClient } from './locations-list-client'
import { INFINITE_SCROLL_LOAD_MORE_SIZE } from '@/lib/constants'

interface PageProps {
  searchParams: Promise<{ search?: string; sort?: string }>
}

export default async function LocationsPage({ searchParams }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const params = await searchParams

  // Build filters from search params with defaults
  const filters: LocationFilterParams = {
    search: params.search,
    sort: (params.sort as LocationFilterParams['sort']) || 'name_asc',
  }

  // Fetch locations server-side with filters
  const locations = await getLocations(filters)

  // Fetch stats server-side
  const stats = await getLocationStats(filters)

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Our Locations" }
  ]

  // Calculate if there are more items to load
  const initialHasMore = locations.length >= INFINITE_SCROLL_LOAD_MORE_SIZE

  return (
    <PageContainer
      title="Locations"
      description="Manage parish locations."
      primaryAction={<ModuleCreateButton moduleName="Location" href="/locations/create" />}
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <LocationsListClient initialData={locations} stats={stats} initialHasMore={initialHasMore} />
    </PageContainer>
  )
}
