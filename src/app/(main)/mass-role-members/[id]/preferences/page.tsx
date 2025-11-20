import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { getPerson } from "@/lib/actions/people"
import { getMassRolePreferences, getBlackoutDates } from "@/lib/actions/mass-role-members-compat"
import { getMassRoles } from "@/lib/actions/mass-roles"
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { MassRolePreferencesForm } from './mass-role-preferences-form'
import { BlackoutDatesCard } from './blackout-dates-card'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function MassRolePreferencesPage({ params }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { id } = await params

  // Fetch person and their data
  const person = await getPerson(id)

  if (!person) {
    notFound()
  }

  const preferences = await getMassRolePreferences(id)
  const blackoutDates = await getBlackoutDates(id)
  const massRoles = await getMassRoles()

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Mass Role Directory", href: "/mass-role-members" },
    { label: `${person.first_name} ${person.last_name}`, href: `/mass-role-members/${person.id}` },
    { label: "Preferences" }
  ]

  return (
    <PageContainer
      title={`Preferences: ${person.first_name} ${person.last_name}`}
      description="Manage scheduling preferences and availability"
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <div className="space-y-6">
        <MassRolePreferencesForm
          person={person}
          preferences={preferences}
          massRoles={massRoles}
        />
        <BlackoutDatesCard
          personId={person.id}
          blackoutDates={blackoutDates}
        />
      </div>
    </PageContainer>
  )
}
