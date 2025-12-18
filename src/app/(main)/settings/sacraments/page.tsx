import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { SacramentsListClient } from './sacraments-list-client'
import { getEventTypes } from '@/lib/actions/event-types'
import { checkSettingsAccess } from '@/lib/auth/permissions'
import { getTranslations } from 'next-intl/server'

export default async function SacramentsPage() {
  // Check admin permissions (redirects if not authorized)
  await checkSettingsAccess()

  const t = await getTranslations()

  // Fetch sacrament event types
  const eventTypes = await getEventTypes({ system_type: 'sacrament' })

  const breadcrumbs = [
    { label: t('nav.dashboard'), href: '/dashboard' },
    { label: t('nav.settings'), href: '/settings' },
    { label: t('nav.sacraments') },
  ]

  return (
    <PageContainer
      title={t('settings.sacraments.title')}
      description={t('settings.sacraments.description')}
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <SacramentsListClient initialData={eventTypes} />
    </PageContainer>
  )
}
