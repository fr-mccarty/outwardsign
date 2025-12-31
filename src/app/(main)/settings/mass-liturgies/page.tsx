import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { MassLiturgiesListClient } from './mass-liturgies-list-client'
import { getEventTypes } from '@/lib/actions/event-types'
import { checkSettingsAccess } from '@/lib/auth/permissions'
import { getTranslations } from 'next-intl/server'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default async function MassesPage() {
  // Check admin permissions (redirects if not authorized)
  await checkSettingsAccess()

  const t = await getTranslations('masses')

  // Fetch mass event types
  const eventTypes = await getEventTypes({ system_type: 'mass-liturgy' })

  const tNav = await getTranslations('nav')
  const breadcrumbs = [
    { label: tNav('dashboard'), href: '/dashboard' },
    { label: tNav('settings'), href: '/settings' },
    { label: tNav('masses') },
  ]

  return (
    <PageContainer
      title={t('title')}
      description={t('description')}
      primaryAction={
        <Button asChild>
          <Link href="/settings/mass-liturgies/create">
            <Plus className="h-4 w-4 mr-2" />
            {t('createTitle')}
          </Link>
        </Button>
      }
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <MassLiturgiesListClient initialData={eventTypes} />
    </PageContainer>
  )
}
