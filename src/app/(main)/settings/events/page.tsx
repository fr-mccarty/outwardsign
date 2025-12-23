import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { EventsListClient } from './events-list-client'
import { getEventTypes } from '@/lib/actions/event-types'
import { checkSettingsAccess } from '@/lib/auth/permissions'
import { getTranslations } from 'next-intl/server'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

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
        <Button asChild>
          <Link href="/settings/events/create">
            <Plus className="h-4 w-4 mr-2" />
            {t('events.createTitle')}
          </Link>
        </Button>
      }
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <EventsListClient initialData={eventTypes} />
    </PageContainer>
  )
}
