import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { DeveloperToolsHubClient } from './developer-tools-hub-client'
import { PageContainer } from '@/components/page-container'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

export default async function DeveloperToolsPage() {
  const t = await getTranslations()
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
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
