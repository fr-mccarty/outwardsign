import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { getPerson } from "@/lib/actions/people"
import { getMassRolePreferences, getBlackoutDates, getPersonRoleStats } from "@/lib/actions/mass-role-preferences"
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { MassRoleDirectoryViewClient } from './mass-role-directory-view-client'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function MassRoleDirectoryDetailPage({ params }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { id } = await params

  // Fetch person and their mass role data server-side
  const person = await getPerson(id)

  if (!person) {
    notFound()
  }

  // Fetch mass role preferences and stats
  const preferences = await getMassRolePreferences(id)
  const blackoutDates = await getBlackoutDates(id)
  const stats = await getPersonRoleStats(id)

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Mass Role Directory", href: "/mass-role-directory" },
    { label: `${person.first_name} ${person.last_name}` }
  ]

  return (
    <PageContainer
      title={`${person.first_name} ${person.last_name}`}
      description="Mass role assignments and preferences"
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <MassRoleDirectoryViewClient
        person={person}
        preferences={preferences}
        blackoutDates={blackoutDates}
        stats={stats}
      />
    </PageContainer>
  )
}
