import { notFound } from 'next/navigation'
import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { getMassTimeWithItems } from '@/lib/actions/mass-times-templates'
import { getEventTypes } from '@/lib/actions/event-types'
import { checkSettingsAccess } from '@/lib/auth/permissions'
import { getTranslations } from 'next-intl/server'
import { MassScheduleDetailClient } from './mass-schedule-detail-client'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function MassScheduleDetailPage({ params }: PageProps) {
  // Check admin permissions (redirects if not authorized)
  await checkSettingsAccess()

  const { id } = await params
  const t = await getTranslations('massSchedules')
  const tNav = await getTranslations('nav')

  // Fetch the template with items
  const template = await getMassTimeWithItems(id)

  if (!template) {
    notFound()
  }

  // Fetch mass event types for the dropdown
  const massEventTypes = await getEventTypes({ system_type: 'mass-liturgy' })

  const breadcrumbs = [
    { label: tNav('dashboard'), href: '/dashboard' },
    { label: tNav('settings'), href: '/settings' },
    { label: t('title'), href: '/settings/mass-schedules' },
    { label: template.name },
  ]

  return (
    <PageContainer
      title={template.name}
      description={t('detailDescription')}
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <MassScheduleDetailClient
        template={template}
        massEventTypes={massEventTypes}
      />
    </PageContainer>
  )
}
