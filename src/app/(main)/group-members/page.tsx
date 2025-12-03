import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { GroupMembersListClient } from './group-members-list-client'
import { getPeopleWithGroupMemberships, getGroups, getGroupMemberStats, type GroupMemberFilters } from '@/lib/actions/groups'
import { getGroupRoles } from '@/lib/actions/group-roles'
import { getPeople } from '@/lib/actions/people'
import { INFINITE_SCROLL_LOAD_MORE_SIZE } from '@/lib/constants'

interface PageProps {
  searchParams: Promise<{
    search?: string
    sort?: string
  }>
}

export default async function GroupMembersPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const params = await searchParams

  const filters: GroupMemberFilters = {
    search: params.search,
    sort: params.sort as GroupMemberFilters['sort']
  }

  // Fetch people with group memberships
  const peopleWithMemberships = await getPeopleWithGroupMemberships(filters)

  // Fetch stats
  const stats = await getGroupMemberStats(filters)

  // Fetch all groups for the picker
  const groups = await getGroups()

  // Fetch all group roles for the picker
  const groupRoles = await getGroupRoles()

  // Fetch all people for adding new memberships
  const allPeople = await getPeople()

  // Calculate if there are more items to load
  const initialHasMore = peopleWithMemberships.length >= INFINITE_SCROLL_LOAD_MORE_SIZE

  return (
    <GroupMembersListClient
      peopleWithMemberships={peopleWithMemberships}
      stats={stats}
      groups={groups}
      groupRoles={groupRoles}
      allPeople={allPeople}
      initialHasMore={initialHasMore}
    />
  )
}
