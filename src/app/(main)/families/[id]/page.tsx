import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getFamily } from '@/lib/actions/families'
import { FamilyViewClient } from './family-view-client'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ViewFamilyPage({ params }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { id } = await params

  // Fetch family with members
  const family = await getFamily(id)

  if (!family) {
    notFound()
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Families", href: "/families" },
    { label: family.family_name }
  ]

  return (
    <PageContainer
      title={family.family_name}
      description="View and manage family members"
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <FamilyViewClient family={family} />
    </PageContainer>
  )
}
