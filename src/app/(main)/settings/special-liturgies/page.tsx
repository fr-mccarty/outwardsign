import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { DescriptionWithDocLink } from '@/components/description-with-doc-link'
import { SpecialLiturgiesListClient } from './special-liturgies-list-client'
import { getEventTypes } from '@/lib/actions/event-types'
import { checkSettingsAccess } from '@/lib/auth/permissions'
import { getTranslations } from 'next-intl/server'

export default async function SpecialLiturgiesPage() {
  // Check admin permissions (redirects if not authorized)
  await checkSettingsAccess()

  const t = await getTranslations()

  // Fetch special liturgy event types
  const eventTypes = await getEventTypes({ system_type: 'special-liturgy' })

  const breadcrumbs = [
    { label: t('nav.dashboard'), href: '/dashboard' },
    { label: t('nav.settings'), href: '/settings' },
    { label: t('nav.specialLiturgies') },
  ]

  return (
    <PageContainer
      title={t('settings.specialLiturgies.title')}
      description={
        <DescriptionWithDocLink
          description={t('settings.specialLiturgies.description')}
          href="/docs/settings"
        />
      }
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <SpecialLiturgiesListClient initialData={eventTypes} />
    </PageContainer>
  )
}
