import { Button } from "@/components/ui/button"
import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import Link from "next/link"
import { Plus } from "lucide-react"
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
    { label: "Locations" }
  ]

  return (
    <PageContainer
      title="Locations"
      description="Manage parish locations."
      maxWidth="7xl"
      actions={
        <Button asChild>
          <Link href="/locations/create">
            <Plus className="h-4 w-4 mr-2" />
            New Location
          </Link>
        </Button>
      }
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <LocationsListClient initialData={locations} stats={stats} />
    </PageContainer>
  )
}
