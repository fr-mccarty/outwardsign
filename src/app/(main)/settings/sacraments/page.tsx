import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { SacramentsListClient } from './sacraments-list-client'
import { getEventTypes } from '@/lib/actions/event-types'
import { getTranslations } from 'next-intl/server'

export default async function SacramentsPage() {
  const t = await getTranslations()
  const supabase = await createClient()

  // Check authentication server-side
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch sacrament event types
  const eventTypes = await getEventTypes({ system_type: 'sacrament' })

  const breadcrumbs = [
    { label: t('nav.dashboard'), href: '/dashboard' },
    { label: t('nav.settings'), href: '/settings' },
    { label: t('nav.sacraments'), href: '/settings/sacraments' },
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <SacramentsListClient initialData={eventTypes} />
    </>
  )
}
