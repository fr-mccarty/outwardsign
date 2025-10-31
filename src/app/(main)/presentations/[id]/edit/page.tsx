import { PageContainer } from "@/components/page-container"
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { getPresentation } from "@/lib/actions/presentations"
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { PresentationForm } from '../../presentation-form'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditPresentationPage({ params }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { id } = await params

  // Fetch presentation server-side
  const presentation = await getPresentation(id)

  if (!presentation) {
    notFound()
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Presentations", href: "/presentations" },
    { label: presentation.child_name, href: `/presentations/${id}` },
    { label: "Edit" }
  ]

  return (
    <PageContainer
      title="Edit Presentation"
      description="Update the child presentation details."
      cardTitle="Presentation Details"
      maxWidth="4xl"
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <PresentationForm presentation={presentation} />
    </PageContainer>
  )
}
