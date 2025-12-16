import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { MassesListClient } from './masses-list-client'
import { getEventTypes } from '@/lib/actions/event-types'
import { getTranslations } from 'next-intl/server'

export default async function MassesPage() {
  const t = await getTranslations()
  const supabase = await createClient()

  // Check authentication server-side
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch mass event types
  const eventTypes = await getEventTypes({ system_type: 'mass' })

  const breadcrumbs = [
    { label: t('nav.dashboard'), href: '/dashboard' },
    { label: t('nav.settings'), href: '/settings' },
    { label: t('nav.masses'), href: '/settings/masses' },
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <MassesListClient initialData={eventTypes} />
    </>
  )
}
