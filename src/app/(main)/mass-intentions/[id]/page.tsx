import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getMassIntentionWithRelations } from '@/lib/actions/mass-intentions'
import { MassIntentionViewClient } from './mass-intention-view-client'
import { getMassIntentionPageTitle } from '@/lib/utils/formatters'

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
  const title = getMassIntentionPageTitle(intention)

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Mass Intentions", href: "/mass-intentions" },
    { label: "View" }
  ]

  return (
    <PageContainer
      title={title}
      description="View Mass intention details."
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <MassIntentionViewClient intention={intention} />
    </PageContainer>
  )
}
