import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { MassTypesListClient } from './mass-types-list-client'
import { getAllMassTypes } from '@/lib/actions/mass-types'

export default async function MassTypesPage() {
  const supabase = await createClient()

  // Check authentication server-side
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch all mass types (including inactive)
  const massTypes = await getAllMassTypes()

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Mass Types', href: '/mass-types' },
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <MassTypesListClient initialData={massTypes} />
    </>
  )
}
