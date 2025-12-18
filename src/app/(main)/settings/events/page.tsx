import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { EventsListClient } from './events-list-client'
import { getEventTypes } from '@/lib/actions/event-types'
import { checkSettingsAccess } from '@/lib/auth/permissions'
import { getTranslations } from 'next-intl/server'

export default async function EventsPage() {
  // Check admin permissions (redirects if not authorized)
  await checkSettingsAccess()

  const t = await getTranslations()

  // Fetch event event types
  const eventTypes = await getEventTypes({ system_type: 'event' })

  const breadcrumbs = [
    { label: t('nav.dashboard'), href: '/dashboard' },
    { label: t('nav.settings'), href: '/settings' },
    { label: t('nav.events') },
  ]

  return (
    <PageContainer
      title={t('settings.events.title')}
      description={t('settings.events.description')}
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <EventsListClient initialData={eventTypes} />
    </PageContainer>
  )
}
