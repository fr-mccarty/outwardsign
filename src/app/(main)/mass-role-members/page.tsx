import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { getPeopleWithMassRolePreferences } from "@/lib/actions/mass-role-members-compat"
import { getMassRoles } from "@/lib/actions/mass-roles"
import { getPeople } from "@/lib/actions/people"
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MassRoleMembersListClient } from './mass-role-members-list-client'
import { MassRoleMembersActions } from './mass-role-members-actions'

interface PageProps {
  searchParams: Promise<{ search?: string; role?: string; status?: string }>
}

export default async function MassRoleMembersPage({ searchParams }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const params = await searchParams

  // Fetch people who have mass role preferences (serve in mass roles)
  const peopleInDirectory = await getPeopleWithMassRolePreferences()
  const massRoles = await getMassRoles()

  // Fetch all people for the picker
  const allPeople = await getPeople()

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Mass Role Directory" }
  ]

  return (
    <PageContainer
      title="Mass Role Directory"
      description="View and manage people serving in liturgical roles."
      primaryAction={<MassRoleMembersActions massRoles={massRoles} allPeople={allPeople} />}
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <MassRoleMembersListClient
        initialData={peopleInDirectory}
        massRoles={massRoles}
      />
    </PageContainer>
  )
}
