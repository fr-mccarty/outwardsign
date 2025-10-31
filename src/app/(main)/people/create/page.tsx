import { PageContainer } from "@/components/page-container"
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PersonForm } from '../person-form'

export default async function CreatePersonPage() {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "People", href: "/people" },
    { label: "Create Person" }
  ]

  return (
    <PageContainer
      title="Create Person"
      description="Add a new person to your parish directory."
      cardTitle="Person Details"
      maxWidth="4xl"
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <PersonForm />
    </PageContainer>
  )
}
