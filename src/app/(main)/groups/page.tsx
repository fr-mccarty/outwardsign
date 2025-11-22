import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { ModuleCreateButton } from '@/components/module-create-button'
import { getGroups } from '@/lib/actions/groups'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { GroupsListClient } from './groups-list-client'

export const dynamic = 'force-dynamic'

export default async function GroupsPage() {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch groups server-side
  const groups = await getGroups()

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Groups" }
  ]

  return (
    <PageContainer
      title="Groups"
      description="Manage groups of people who serve together in liturgical ministries"
      actions={<ModuleCreateButton moduleName="Group" href="/groups/create" />}
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <GroupsListClient initialData={groups} />
    </PageContainer>
  )
}
