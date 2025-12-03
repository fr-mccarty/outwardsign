import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { GroupBaptismFormWrapper } from '../group-baptism-form-wrapper'

export default async function CreateGroupBaptismPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Our Group Baptisms', href: '/group-baptisms' },
    { label: 'Create', href: '/group-baptisms/create' }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <GroupBaptismFormWrapper
        title="Create Group Baptism"
        description="Create a new group baptism ceremony for multiple children."
      />
    </>
  )
}
