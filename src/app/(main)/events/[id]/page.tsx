import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getEventWithRelations, computeMasterEventTitle } from '@/lib/actions/master-events'
import { getScripts } from '@/lib/actions/scripts'
import { EventViewClient } from './event-view-client'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ViewEventPage({ params }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { id } = await params
  const event = await getEventWithRelations(id)

  if (!event) {
    notFound()
  }

  // Fetch scripts if Event has an event type
  const scripts = event.event_type_id ? await getScripts(event.event_type_id) : []

  // Build dynamic title from computeMasterEventTitle
  const title = await computeMasterEventTitle(event)

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Events", href: "/events" },
    { label: "View" }
  ]

  return (
    <PageContainer
      title={title}
      description="Preview and download event documents."
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <EventViewClient event={event} scripts={scripts} />
    </PageContainer>
  )
}
