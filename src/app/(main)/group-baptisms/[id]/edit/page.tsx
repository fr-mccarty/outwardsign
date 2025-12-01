import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { GroupBaptismFormWrapper } from '../../group-baptism-form-wrapper'
import { getGroupBaptismWithRelations } from '@/lib/actions/group-baptisms'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditGroupBaptismPage({ params }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { id } = await params
  const groupBaptism = await getGroupBaptismWithRelations(id)
  if (!groupBaptism) notFound()

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Group Baptisms', href: '/group-baptisms' },
    { label: groupBaptism.name || 'View', href: `/group-baptisms/${id}` },
    { label: 'Edit', href: `/group-baptisms/${id}/edit` }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <GroupBaptismFormWrapper
        groupBaptism={groupBaptism}
        title="Edit Group Baptism"
        description="Update group baptism details and manage baptisms in this group."
        saveButtonLabel="Save Changes"
      />
    </>
  )
}
