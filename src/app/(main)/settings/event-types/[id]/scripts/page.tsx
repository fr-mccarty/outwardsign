import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { getEventType } from '@/lib/actions/event-types'
import { getScripts } from '@/lib/actions/scripts'
import { getInputFieldDefinitions } from '@/lib/actions/input-field-definitions'
import { EventTypeScriptsClient } from './event-type-scripts-client'

interface EventTypeScriptsPageProps {
  params: Promise<{ id: string }>
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
  const { id } = await params

  // Fetch event type, scripts, and input field definitions
  const eventType = await getEventType(id)
  if (!eventType) {
    notFound()
  }

  const scripts = await getScripts(id)
  const inputFields = await getInputFieldDefinitions(id)

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Settings', href: '/settings' },
    { label: 'Event Types', href: '/settings/event-types' },
    { label: eventType.name, href: `/settings/event-types/${id}` },
    { label: 'Scripts', href: `/settings/event-types/${id}/scripts` },
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
