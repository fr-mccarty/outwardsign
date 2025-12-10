import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { getEventType } from '@/lib/actions/event-types'
import { EventTypeSettingsClient } from './event-type-settings-client'

interface EventTypeDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function EventTypeDetailPage({
  params,
}: EventTypeDetailPageProps) {
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

  // Fetch event type
  const eventType = await getEventType(id)
  if (!eventType) {
    notFound()
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Settings', href: '/settings' },
    { label: 'Event Types', href: '/settings/event-types' },
    { label: eventType.name, href: `/settings/event-types/${id}` },
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <EventTypeSettingsClient eventType={eventType} />
    </>
  )
}
