import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getLocation } from '@/lib/actions/locations'
import { LocationViewClient } from './location-view-client'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function LocationPage({ params }: PageProps) {
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
    { label: location.name }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <LocationViewClient location={location} />
    </>
  )
}
