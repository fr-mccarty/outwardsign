import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getFamily } from '@/lib/actions/families'
import { FamilyFormWrapper } from '../../family-form-wrapper'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditFamilyPage({ params }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { id } = await params

  // Fetch family
  const family = await getFamily(id)

  if (!family) {
    notFound()
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Families", href: "/families" },
    { label: family.family_name, href: `/families/${id}` },
    { label: "Edit" }
  ]

  return (
    <PageContainer
      title={`Edit ${family.family_name}`}
      description="Update family information"
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <FamilyFormWrapper family={family} />
    </PageContainer>
  )
}
