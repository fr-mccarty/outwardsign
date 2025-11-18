import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getCurrentParish } from '@/lib/auth/parish'
import { getParishMembers, getParishSettings } from '@/lib/actions/setup'
import { getParishInvitations } from '@/lib/actions/invitations'
import { getPetitionTemplates, ensureDefaultContexts } from '@/lib/actions/petition-templates'
import { getReadingsStats } from '@/lib/actions/import-readings'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { ParishSettingsClient } from './parish-settings-client'

export const dynamic = 'force-dynamic'

export default async function ParishSettingsPage() {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Get current parish
  const parish = await getCurrentParish()
  if (!parish) {
    redirect('/dashboard')
  }

  // Load all data server-side
  const [
    settingsResult,
    membersResult,
    invitations,
    readingsStats
  ] = await Promise.all([
    getParishSettings(parish.id),
    getParishMembers(parish.id),
    getParishInvitations().catch(() => []),
    getReadingsStats().catch(() => ({ totalReadings: 0, categories: [], translations: [] }))
  ])

  // Load petition templates
  await ensureDefaultContexts()
  const petitionTemplates = await getPetitionTemplates()

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Settings", href: "/settings" },
    { label: "Parish Settings" }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <ParishSettingsClient
        parish={parish}
        parishSettings={settingsResult.success ? settingsResult.settings : null}
        initialMembers={membersResult.members || []}
        initialInvitations={invitations}
        initialPetitionTemplates={petitionTemplates}
        initialReadingsStats={readingsStats}
        currentUserId={user.id}
      />
    </>
  )
}
