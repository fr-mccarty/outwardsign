import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { GroupBaptismViewClient } from './group-baptism-view-client'
import { getGroupBaptismWithRelations } from '@/lib/actions/group-baptisms'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function GroupBaptismPage({ params }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { id } = await params
  const groupBaptism = await getGroupBaptismWithRelations(id)
  if (!groupBaptism) notFound()

  // Build dynamic title from group baptism data
  const title = groupBaptism.name

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Our Group Baptisms', href: '/group-baptisms' },
    { label: 'View' }
  ]

  return (
    <PageContainer
      title={title}
      description="Preview and download group baptism liturgy documents."
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <GroupBaptismViewClient groupBaptism={groupBaptism} />
    </PageContainer>
  )
}
