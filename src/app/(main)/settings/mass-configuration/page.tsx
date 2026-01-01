import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
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
      description={t('settings.sections.massConfigurationDescription')}
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <MassConfigurationClient />
    </PageContainer>
  )
}
