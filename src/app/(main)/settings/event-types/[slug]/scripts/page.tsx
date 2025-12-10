import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { getEventTypeBySlug } from '@/lib/actions/event-types'
import { getScripts } from '@/lib/actions/scripts'
import { getInputFieldDefinitions } from '@/lib/actions/input-field-definitions'
import { EventTypeScriptsClient } from './event-type-scripts-client'

interface EventTypeScriptsPageProps {
  params: Promise<{ slug: string }>
}

export default async function EventTypeScriptsPage({
  params,
}: EventTypeScriptsPageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Await params (Next.js 15 requirement)
  const { slug } = await params

  // Fetch event type by slug
  const eventType = await getEventTypeBySlug(slug)
  if (!eventType) {
    notFound()
  }

  // Fetch scripts and input fields using the event type ID
  const scripts = await getScripts(eventType.id)
  const inputFields = await getInputFieldDefinitions(eventType.id)

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Settings', href: '/settings' },
    { label: 'Event Types', href: '/settings/event-types' },
    { label: eventType.name, href: `/settings/event-types/${eventType.slug}` },
    { label: 'Scripts', href: `/settings/event-types/${eventType.slug}/scripts` },
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <EventTypeScriptsClient
        eventType={eventType}
        initialScripts={scripts}
        inputFields={inputFields}
      />
    </>
  )
}
