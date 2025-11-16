import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getMassIntentionWithRelations } from '@/lib/actions/mass-intentions'
import { MassIntentionViewClient } from './mass-intention-view-client'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ViewMassIntentionPage({ params }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { id } = await params
  const intention = await getMassIntentionWithRelations(id)

  if (!intention) {
    notFound()
  }

  // Build dynamic title
  let title = "Mass Intention"
  if (intention.mass_offered_for) {
    const truncatedText = intention.mass_offered_for.substring(0, 50)
    title = `${truncatedText}${intention.mass_offered_for.length > 50 ? '...' : ''}-Mass Intention`
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Mass Intentions", href: "/mass-intentions" },
    { label: "View" }
  ]

  return (
    <PageContainer
      title={title}
      description="View Mass intention details."
      maxWidth="4xl"
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <MassIntentionViewClient intention={intention} />
    </PageContainer>
  )
}
