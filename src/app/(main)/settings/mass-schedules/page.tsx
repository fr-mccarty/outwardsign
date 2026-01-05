import { Plus } from 'lucide-react'
import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { DescriptionWithDocLink } from '@/components/description-with-doc-link'
import { MassSchedulesListClient } from './mass-schedules-list-client'
import { getMassTimesWithItems } from '@/lib/actions/mass-times-templates'
import { checkSettingsAccess } from '@/lib/auth/permissions'
import { getTranslations } from 'next-intl/server'
import { LinkButton } from '@/components/link-button'

export default async function MassSchedulesPage() {
  // Check admin permissions (redirects if not authorized)
  await checkSettingsAccess()

  const t = await getTranslations('massSchedules')
  const tNav = await getTranslations('nav')

  // Fetch all mass times templates with their items
  const templates = await getMassTimesWithItems()

  const breadcrumbs = [
    { label: tNav('dashboard'), href: '/dashboard' },
    { label: tNav('settings'), href: '/settings' },
    { label: t('title') },
  ]

  return (
    <PageContainer
      title={t('title')}
      description={
        <DescriptionWithDocLink
          description={t('description')}
          href="/docs/settings#mass"
        />
      }
      primaryAction={
        <LinkButton href="/settings/mass-schedules/create">
          <Plus className="h-4 w-4 mr-2" />
          {t('createSchedule')}
        </LinkButton>
      }
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <MassSchedulesListClient initialData={templates} />
    </PageContainer>
  )
}
