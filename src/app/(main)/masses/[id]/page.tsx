import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getEventWithRelations, computeMasterEventTitle } from '@/lib/actions/master-events'
import { getScripts } from '@/lib/actions/scripts'
import { MassViewClient } from './mass-view-client'
import { getTranslations } from 'next-intl/server'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ViewMassPage({ params }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { id } = await params
  const mass = await getEventWithRelations(id)

  if (!mass) {
    notFound()
  }

  // Fetch scripts if Mass has an event type
  const scripts = mass.event_type_id ? await getScripts(mass.event_type_id) : []

  // Build dynamic title from computeMasterEventTitle
  const title = await computeMasterEventTitle(mass)

  const t = await getTranslations()

  const breadcrumbs = [
    { label: t('nav.dashboard'), href: "/dashboard" },
    { label: t('nav.masses'), href: "/masses" },
    { label: title }
  ]

  return (
    <PageContainer
      title={title}
      description="Preview and download Mass liturgy documents."
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <MassViewClient mass={mass} scripts={scripts} />
    </PageContainer>
  )
}
