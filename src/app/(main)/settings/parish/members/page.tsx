import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getCurrentParish } from '@/lib/auth/parish'
import { getParishMembers } from '@/lib/actions/setup'
import { getParishInvitations } from '@/lib/actions/invitations'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { ParishMembersSettingsClient } from './parish-members-settings-client'

export const dynamic = 'force-dynamic'

export default async function ParishMembersSettingsPage() {
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

  // Load members and invitations
  const membersResult = await getParishMembers(parish.id)
  const invitations = await getParishInvitations()

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Settings", href: "/settings" },
    { label: "Parish Settings", href: "/settings/parish/general" },
    { label: "Members" }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <ParishMembersSettingsClient
        parish={parish}
        initialMembers={membersResult.members || []}
        initialInvitations={invitations}
        currentUserId={user.id}
      />
    </>
  )
}
