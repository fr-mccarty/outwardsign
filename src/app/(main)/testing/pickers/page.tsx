import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PickersTestClient } from './pickers-test-client'

export default async function PickersTestPage() {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Testing", href: "/testing" },
    { label: "Pickers Test" }
  ]

  return (
    <PageContainer
      title="Picker Component Testing"
      description="Test and preview picker components"
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <PickersTestClient />
    </PageContainer>
  )
}
