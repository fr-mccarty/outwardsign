import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { SpecialLiturgiesListClient } from './special-liturgies-list-client'
import { getEventTypes } from '@/lib/actions/event-types'
import { getTranslations } from 'next-intl/server'

export default async function SpecialLiturgiesPage() {
  const t = await getTranslations()
  const supabase = await createClient()

  // Check authentication server-side
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch special liturgy event types
  const eventTypes = await getEventTypes({ category: 'special_liturgy' })

  const breadcrumbs = [
    { label: t('nav.dashboard'), href: '/dashboard' },
    { label: t('nav.settings'), href: '/settings' },
    { label: t('nav.specialLiturgies'), href: '/settings/special-liturgies' },
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <SpecialLiturgiesListClient initialData={eventTypes} />
    </>
  )
}
