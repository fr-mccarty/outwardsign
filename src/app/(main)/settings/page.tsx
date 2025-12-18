import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { checkSettingsAccess } from '@/lib/auth/permissions'
import { SettingsHubClient } from './settings-hub-client'
import { getTranslations } from 'next-intl/server'

export default async function SettingsPage() {
  // Check admin permissions (redirects if not authorized)
  await checkSettingsAccess()

  const t = await getTranslations()

  const breadcrumbs = [
    { label: t('nav.dashboard'), href: '/dashboard' },
    { label: t('nav.settings') },
  ]

  return (
    <PageContainer
      title={t('settings.title')}
      description={t('settings.description')}
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <SettingsHubClient />
    </PageContainer>
  )
}
