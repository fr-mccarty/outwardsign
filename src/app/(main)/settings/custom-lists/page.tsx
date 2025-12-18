import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { getCustomLists } from '@/lib/actions/custom-lists'
import { CustomListsListClient } from './custom-lists-list-client'
import { checkSettingsAccess } from '@/lib/auth/permissions'
import { getTranslations } from 'next-intl/server'

export default async function CustomListsPage() {
  // Check admin permissions (redirects if not authorized)
  await checkSettingsAccess()

  const t = await getTranslations()

  const customLists = await getCustomLists()

  const breadcrumbs = [
    { label: t('nav.dashboard'), href: '/dashboard' },
    { label: t('nav.settings'), href: '/settings' },
    { label: t('settings.customLists') },
  ]

  return (
    <PageContainer
      title={t('settings.customLists')}
      description={t('settings.customListsDescription')}
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <CustomListsListClient initialData={customLists} />
    </PageContainer>
  )
}
