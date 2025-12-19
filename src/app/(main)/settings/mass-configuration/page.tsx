import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { checkSettingsAccess } from '@/lib/auth/permissions'
import { MassConfigurationHubClient } from './mass-configuration-hub-client'
import { getTranslations } from 'next-intl/server'

export default async function MassConfigurationPage() {
  // Check admin permissions (redirects if not authorized)
  await checkSettingsAccess()

  const t = await getTranslations()

  const breadcrumbs = [
    { label: t('nav.dashboard'), href: '/dashboard' },
    { label: t('nav.settings'), href: '/settings' },
    { label: t('nav.massConfiguration') },
  ]

  return (
    <PageContainer
      title={t('settings.massConfiguration')}
      description={t('settings.massConfigurationDescription')}
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <MassConfigurationHubClient />
    </PageContainer>
  )
}
