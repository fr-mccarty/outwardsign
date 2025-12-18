import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { MassesListClient } from './masses-list-client'
import { getEventTypes } from '@/lib/actions/event-types'
import { checkSettingsAccess } from '@/lib/auth/permissions'
import { getTranslations } from 'next-intl/server'

export default async function MassesPage() {
  // Check admin permissions (redirects if not authorized)
  await checkSettingsAccess()

  const t = await getTranslations()

  // Fetch mass event types
  const eventTypes = await getEventTypes({ system_type: 'mass' })

  const breadcrumbs = [
    { label: t('nav.dashboard'), href: '/dashboard' },
    { label: t('nav.settings'), href: '/settings' },
    { label: t('nav.masses') },
  ]

  return (
    <PageContainer
      title={t('settings.masses.title')}
      description={t('settings.masses.description')}
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <MassesListClient initialData={eventTypes} />
    </PageContainer>
  )
}
