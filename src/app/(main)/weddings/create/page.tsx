import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { WeddingForm } from '../wedding-form'

export default async function CreateWeddingPage() {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Weddings", href: "/weddings" },
    { label: "Create" }
  ]

  return (
    <PageContainer
      title="Create Wedding"
      description="Add a new wedding celebration to your parish."
      maxWidth="4xl"
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <WeddingForm />
    </PageContainer>
  )
}
