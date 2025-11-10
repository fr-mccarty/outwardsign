import { PageContainer } from "@/components/page-container"
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ReadingForm } from '../reading-form'

export default async function CreateReadingPage() {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Our Readings", href: "/readings" },
    { label: "Create Reading" }
  ]

  return (
    <PageContainer
      title="Create Reading"
      description="Add a new scripture reading or liturgical text to your collection."
      cardTitle="Reading Details"
      maxWidth="4xl"
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <ReadingForm />
    </PageContainer>
  )
}
