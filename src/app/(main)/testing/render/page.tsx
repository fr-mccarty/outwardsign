import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { RenderTestClient } from './render-test-client'

export default async function RenderTestPage() {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Testing", href: "/testing" },
    { label: "Render Test" }
  ]

  return (
    <PageContainer
      title="Render Test"
      description="Test the rich text editor and content rendering"
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <RenderTestClient />
    </PageContainer>
  )
}
