import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getLocation } from '@/lib/actions/locations'
import { LocationFormWrapper } from '../../location-form-wrapper'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditLocationPage({ params }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { id } = await params
  const location = await getLocation(id)

  if (!location) {
    notFound()
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Locations", href: "/locations" },
    { label: location.name, href: `/locations/${id}` },
    { label: "Edit" }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <LocationFormWrapper
        location={location}
        title="Edit Location"
        description="Update location information"
        saveButtonLabel="Save Changes"
      />
    </>
  )
}
