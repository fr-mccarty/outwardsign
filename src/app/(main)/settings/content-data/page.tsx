import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { checkSettingsAccess } from '@/lib/auth/permissions'
import { getTranslations } from 'next-intl/server'
import { ContentDataClient } from './content-data-client'

export default async function ContentDataPage() {
  await checkSettingsAccess()
  const t = await getTranslations()

  const breadcrumbs = [
    { label: t('nav.dashboard'), href: '/dashboard' },
    { label: t('nav.settings'), href: '/settings' },
    { label: t('settings.sections.contentData') },
  ]

  return (
    <PageContainer
      title={t('settings.sections.contentData')}
      description={t('settings.sections.contentDataDescription')}
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <ContentDataClient />
    </PageContainer>
  )
}
