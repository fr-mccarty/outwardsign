import { redirect } from 'next/navigation'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { DeveloperToolsHubClient } from './developer-tools-hub-client'
import { PageContainer } from '@/components/page-container'
import { getTranslations } from 'next-intl/server'
import { checkIsDeveloper } from '@/lib/auth/developer'

export const dynamic = 'force-dynamic'

export default async function DeveloperToolsPage() {
  const t = await getTranslations()

  // Check developer access - redirects if not a developer
  const { isDeveloper } = await checkIsDeveloper()
  if (!isDeveloper) {
    redirect('/settings')
  }

  const breadcrumbs = [
    { label: t('nav.dashboard'), href: '/dashboard' },
    { label: t('nav.settings'), href: '/settings' },
    { label: t('settings.developerTools.title') }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <PageContainer
        title={t('settings.developerTools.title')}
        description="Tools for debugging templates, seeding data, and troubleshooting"
      >
        <DeveloperToolsHubClient />
      </PageContainer>
    </>
  )
}
