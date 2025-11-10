import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LocationFormWrapper } from '../location-form-wrapper'

export default async function CreateLocationPage() {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Our Locations", href: "/locations" },
    { label: "Create" }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <LocationFormWrapper
        title="Create Location"
        description="Add a new location to your parish"
        saveButtonLabel="Create Location"
      />
    </>
  )
}
