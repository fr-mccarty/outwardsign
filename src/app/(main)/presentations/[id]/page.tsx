import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getPresentationWithRelations } from '@/lib/actions/presentations'
import { PresentationViewClient } from './presentation-view-client'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ViewPresentationPage({ params }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { id } = await params
  const presentation = await getPresentationWithRelations(id)

  if (!presentation) {
    notFound()
  }

  // Build dynamic title from child name
  const child = presentation.child
  let title = "Presentation"

  if (child?.last_name) {
    title = `${child.last_name}-Presentation`
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Our Presentations", href: "/presentations" },
    { label: "View" }
  ]

  return (
    <PageContainer
      title={title}
      description="Preview and download presentation liturgy documents."
      maxWidth="7xl"
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <PresentationViewClient presentation={presentation} />
    </PageContainer>
  )
}
