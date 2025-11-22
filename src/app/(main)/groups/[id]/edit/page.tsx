import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getGroup } from '@/lib/actions/groups'
import { GroupFormWrapper } from '../../group-form-wrapper'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditGroupPage({ params }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { id } = await params
  const group = await getGroup(id)

  if (!group) {
    notFound()
  }

  // Build dynamic title from group name
  const title = group.name

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Groups", href: "/groups" },
    { label: "Edit" }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <GroupFormWrapper
        group={group}
        title={title}
        description="Update group information and manage members."
        saveButtonLabel="Save Group"
      />
    </>
  )
}
