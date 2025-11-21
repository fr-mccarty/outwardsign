import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { getMassRolesWithCounts } from '@/lib/actions/mass-roles'
import { MassRolesListClient } from './mass-roles-list-client'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ search?: string }>
}

export default async function MassRolesPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const params = await searchParams
  const search = params.search || ''

  // Fetch all mass roles with member counts
  const massRoles = await getMassRolesWithCounts()

  // Apply search filter on the server
  const filteredRoles = search
    ? massRoles.filter(role =>
        role.name.toLowerCase().includes(search.toLowerCase()) ||
        role.description?.toLowerCase().includes(search.toLowerCase())
      )
    : massRoles

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Settings', href: '/settings' },
    { label: 'Mass Roles' }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <MassRolesListClient massRoles={filteredRoles} searchQuery={search} />
    </>
  )
}
