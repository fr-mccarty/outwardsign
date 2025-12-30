import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { SeedDataClient } from './seed-data-client'
import { PageContainer } from '@/components/page-container'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

export default async function SeedDataPage() {
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
    { label: t('settings.developerTools.title'), href: '/settings/developer-tools' },
    { label: 'Sample Data Seeder' }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <PageContainer
        title="Sample Data Seeder"
        description="Populate your parish with realistic test data for development and testing."
      >
        <SeedDataClient />
      </PageContainer>
    </>
  )
}
