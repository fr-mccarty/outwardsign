import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { EventTypesListClient } from './event-types-list-client'
import { getEventTypes } from '@/lib/actions/event-types'
import { getTranslations } from 'next-intl/server'

export default async function EventTypesPage() {
  const t = await getTranslations()
  const supabase = await createClient()

  // Check authentication server-side
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch all event types (including inactive)
  const eventTypes = await getEventTypes()

  const breadcrumbs = [
    { label: t('nav.dashboard'), href: '/dashboard' },
    { label: t('nav.settings'), href: '/settings' },
    { label: t('nav.eventTypes'), href: '/settings/event-types' },
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <EventTypesListClient initialData={eventTypes} />
    </>
  )
}
