import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FamilyFormWrapper } from '../family-form-wrapper'

export default async function CreateFamilyPage() {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Families", href: "/families" },
    { label: "Create Family" }
  ]

  return (
    <PageContainer
      title="Create Family"
      description="Create a new family to link parishioners together"
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <FamilyFormWrapper />
    </PageContainer>
  )
}
