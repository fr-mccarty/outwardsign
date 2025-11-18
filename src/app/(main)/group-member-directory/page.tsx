import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { GroupMemberDirectoryListClient } from './group-member-directory-list-client'
import { getPeopleWithGroupMemberships, getGroups } from '@/lib/actions/groups'
import { getGroupRoles } from '@/lib/actions/group-roles'
import { getPeople } from '@/lib/actions/people'

export default async function GroupMemberDirectoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch people with group memberships
  const peopleWithMemberships = await getPeopleWithGroupMemberships()

  // Fetch all groups for the picker
  const groups = await getGroups()

  // Fetch all group roles for the picker
  const groupRoles = await getGroupRoles()

  // Fetch all people for adding new memberships
  const allPeople = await getPeople()

  return (
    <GroupMemberDirectoryListClient
      peopleWithMemberships={peopleWithMemberships}
      groups={groups}
      groupRoles={groupRoles}
      allPeople={allPeople}
    />
  )
}
