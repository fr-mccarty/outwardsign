import { createClient } from '@/lib/supabase/server'
import { getCurrentParish } from '@/lib/auth/parish'
import { getParishMembers } from '@/lib/actions/setup'
import { getParishInvitations } from '@/lib/actions/invitations'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { ParishUsersSettingsClient } from './parish-users-settings-client'
import { checkSettingsAccess } from '@/lib/auth/permissions'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

export default async function ParishUsersSettingsPage() {
  // Check admin permissions (redirects if not authorized)
  await checkSettingsAccess()

  const t = await getTranslations()
  const supabase = await createClient()

  // Get current user (already verified by checkSettingsAccess)
  const { data: { user } } = await supabase.auth.getUser()

  // Get current parish
  const parish = await getCurrentParish()
  if (!parish) {
    redirect('/dashboard')
  }

  // Load users and invitations
  const usersResult = await getParishMembers(parish.id)
  const invitations = await getParishInvitations()

  const breadcrumbs = [
    { label: t('nav.dashboard'), href: '/dashboard' },
    { label: t('nav.settings'), href: '/settings' },
    { label: t('settings.parishSettings'), href: '/settings/parish/general' },
    { label: t('settings.parish.users') }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <ParishUsersSettingsClient
        parish={parish}
        initialUsers={usersResult.members || []}
        initialInvitations={invitations}
        currentUserId={user!.id}
      />
    </>
  )
}
