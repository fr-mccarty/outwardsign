import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { checkSettingsAccess } from '@/lib/auth/permissions'
import { getTranslations } from 'next-intl/server'
import { ParishEventsClient } from './parish-events-client'

export default async function ParishEventsSettingsPage() {
  await checkSettingsAccess()
  const t = await getTranslations()

  const breadcrumbs = [
    { label: t('nav.dashboard'), href: '/dashboard' },
    { label: t('nav.settings'), href: '/settings' },
    { label: t('settings.sections.parishEvents') },
  ]

  return (
    <PageContainer
      title={t('settings.sections.parishEvents')}
      description={t('settings.sections.parishEventsDescription')}
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <ParishEventsClient />
    </PageContainer>
  )
}
