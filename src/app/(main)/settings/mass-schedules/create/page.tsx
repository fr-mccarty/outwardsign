import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { checkSettingsAccess } from '@/lib/auth/permissions'
import { getTranslations } from 'next-intl/server'
import { MassScheduleFormClient } from './mass-schedule-form-client'

export default async function CreateMassSchedulePage() {
  // Check admin permissions (redirects if not authorized)
  await checkSettingsAccess()

  const t = await getTranslations('massSchedules')
  const tNav = await getTranslations('nav')

  const breadcrumbs = [
    { label: tNav('dashboard'), href: '/dashboard' },
    { label: tNav('settings'), href: '/settings' },
    { label: t('title'), href: '/settings/mass-schedules' },
    { label: t('createSchedule') },
  ]

  return (
    <PageContainer
      title={t('createSchedule')}
      description={t('createDescription')}
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <MassScheduleFormClient />
    </PageContainer>
  )
}
