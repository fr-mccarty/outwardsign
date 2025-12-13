import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserSettings } from '@/lib/actions/user-settings'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { UserSettingsClient } from './user-settings-client'
import { PageContainer } from '@/components/page-container'
import { EmptyState } from '@/components/empty-state'
import { User } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

export default async function UserSettingsPage() {
  const t = await getTranslations()
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Load user settings
  const userSettings = await getUserSettings()

  if (!userSettings) {
    return (
      <>
        <BreadcrumbSetter breadcrumbs={[
          { label: t('nav.dashboard'), href: "/dashboard" },
          { label: t('nav.settings'), href: "/settings" },
          { label: t('settings.userPreferences') }
        ]} />
        <PageContainer
          title={t('settings.userPreferences')}
          description={t('settings.userPreferencesDescription')}
        >
          <EmptyState
            icon={<User className="h-16 w-16" />}
            title={t('settings.unableToLoadSettings')}
            description={t('settings.errorLoadingSettings')}
          />
        </PageContainer>
      </>
    )
  }

  const breadcrumbs = [
    { label: t('nav.dashboard'), href: "/dashboard" },
    { label: t('nav.settings'), href: "/settings" },
    { label: t('settings.userPreferences') }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <UserSettingsClient
        user={user}
        userSettings={userSettings}
      />
    </>
  )
}
