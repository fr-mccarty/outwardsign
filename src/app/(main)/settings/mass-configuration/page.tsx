import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { DescriptionWithDocLink } from '@/components/description-with-doc-link'
import { checkSettingsAccess } from '@/lib/auth/permissions'
import { getTranslations } from 'next-intl/server'
import { MassConfigurationClient } from './mass-configuration-client'

export default async function MassConfigurationPage() {
  await checkSettingsAccess()
  const t = await getTranslations()

  const breadcrumbs = [
    { label: t('nav.dashboard'), href: '/dashboard' },
    { label: t('nav.settings'), href: '/settings' },
    { label: t('settings.sections.massConfiguration') },
  ]

  return (
    <PageContainer
      title={t('settings.sections.massConfiguration')}
      description={
        <DescriptionWithDocLink
          description={t('settings.sections.massConfigurationDescription')}
          href="/docs/settings#mass"
        />
      }
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <MassConfigurationClient />
    </PageContainer>
  )
}
