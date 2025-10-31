import { PageContainer } from "@/components/page-container"
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PresentationForm } from '../presentation-form'

export default async function CreatePresentationPage() {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Presentations", href: "/presentations" },
    { label: "Create Presentation" }
  ]

  return (
    <PageContainer
      title="Create Presentation"
      description="Add a new child presentation to your parish records."
      cardTitle="Presentation Details"
      maxWidth="4xl"
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <PresentationForm />
    </PageContainer>
  )
}
