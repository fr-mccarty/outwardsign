import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getCurrentParish } from '@/lib/auth/parish'
import { getParishMembers } from '@/lib/actions/setup'
import { getParishInvitations } from '@/lib/actions/invitations'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { ParishUsersSettingsClient } from './parish-users-settings-client'

export const dynamic = 'force-dynamic'

export default async function ParishUsersSettingsPage() {
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

  // Load users and invitations
  const usersResult = await getParishMembers(parish.id)
  const invitations = await getParishInvitations()

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Settings", href: "/settings" },
    { label: "Parish Settings", href: "/settings/parish/general" },
    { label: "Users" }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <ParishUsersSettingsClient
        parish={parish}
        initialUsers={usersResult.members || []}
        initialInvitations={invitations}
        currentUserId={user.id}
      />
    </>
  )
}
