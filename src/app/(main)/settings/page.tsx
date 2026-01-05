import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { DescriptionWithDocLink } from '@/components/description-with-doc-link'
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
      description={
        <DescriptionWithDocLink
          description={t('settings.description')}
          href="/docs/settings"
          linkText="View documentation"
        />
      }
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <SettingsHubClient />
    </PageContainer>
  )
}
