import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getEventWithRelations, computeMasterEventTitle } from '@/lib/actions/master-events'
import { getScripts } from '@/lib/actions/scripts'
import { getMassIntentionsByCalendarEvents } from '@/lib/actions/mass-intentions'
import { MassLiturgyViewClient } from './mass-liturgy-view-client'
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

  // Fetch intentions for all calendar events
  const calendarEventIds = mass.calendar_events?.map(ce => ce.id) || []
  const intentionsMap = await getMassIntentionsByCalendarEvents(calendarEventIds)
  // Convert Map to plain object for serialization to client
  const intentionsByCalendarEvent: Record<string, Awaited<ReturnType<typeof getMassIntentionsByCalendarEvents>> extends Map<string, infer V> ? V : never> = {}
  intentionsMap.forEach((intentions, calendarEventId) => {
    intentionsByCalendarEvent[calendarEventId] = intentions
  })

  // Build dynamic title from computeMasterEventTitle
  const title = await computeMasterEventTitle(mass)

  const t = await getTranslations()

  const breadcrumbs = [
    { label: t('nav.dashboard'), href: "/dashboard" },
    { label: t('nav.masses'), href: "/mass-liturgies" },
    { label: title }
  ]

  return (
    <PageContainer
      title={title}
      description="Preview and download Mass liturgy documents."
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <MassLiturgyViewClient
        mass={mass}
        scripts={scripts}
        intentionsByCalendarEvent={intentionsByCalendarEvent}
      />
    </PageContainer>
  )
}
