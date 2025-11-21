import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { GroupMembershipsForm } from './group-memberships-form'
import { getPersonGroupMemberships, getGroups } from '@/lib/actions/groups'
import { getGroupRoles } from '@/lib/actions/group-roles'
import { getPerson } from '@/lib/actions/people'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function GroupMembershipsPage({ params }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { id } = await params

  // Fetch person details
  const person = await getPerson(id)
  if (!person) {
    notFound()
  }

  // Fetch person's group memberships
  const memberships = await getPersonGroupMemberships(id)

  // Fetch all groups and group roles for the form
  const groups = await getGroups()
  const groupRoles = await getGroupRoles()

  return (
    <GroupMembershipsForm
      person={person}
      memberships={memberships}
      groups={groups}
      groupRoles={groupRoles}
    />
  )
}
