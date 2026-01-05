import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { EventsListClient } from './events-list-client'
import { getEventTypes } from '@/lib/actions/event-types'
import { checkSettingsAccess } from '@/lib/auth/permissions'
import { getTranslations } from 'next-intl/server'
import { LinkButton } from '@/components/link-button'
import { Plus } from 'lucide-react'

export default async function EventsPage() {
  // Check admin permissions (redirects if not authorized)
  await checkSettingsAccess()

  const t = await getTranslations()

  // Fetch event event types
  const eventTypes = await getEventTypes({ system_type: 'parish-event' })

  const breadcrumbs = [
    { label: t('nav.dashboard'), href: '/dashboard' },
    { label: t('nav.settings'), href: '/settings' },
    { label: t('nav.events') },
  ]

  return (
    <PageContainer
      title={t('settings.events.title')}
      description={t('settings.events.description')}
      primaryAction={
        <LinkButton href="/settings/events/create">
          <Plus className="h-4 w-4 mr-2" />
          {t('events.createTitle')}
        </LinkButton>
      }
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <EventsListClient initialData={eventTypes} />
    </PageContainer>
  )
}
