import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { MassTimeFormWrapper } from '../mass-time-form-wrapper'

export default async function CreateMassTimePage() {
  const supabase = await createClient()

  // Check authentication server-side
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Mass Times', href: '/mass-times' },
    { label: 'Create' },
  ]

  return (
    <PageContainer
      title="Create Mass Time"
      description="Create a new recurring mass schedule for your parish."
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <MassTimeFormWrapper />
    </PageContainer>
  )
}
