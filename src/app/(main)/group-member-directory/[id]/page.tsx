import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { GroupMemberDirectoryViewClient } from './group-member-directory-view-client'
import { getPersonGroupMemberships } from '@/lib/actions/groups'
import { getPerson } from '@/lib/actions/people'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function GroupMemberDirectoryPersonPage({ params }: PageProps) {
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

  return (
    <GroupMemberDirectoryViewClient
      person={person}
      memberships={memberships}
    />
  )
}
