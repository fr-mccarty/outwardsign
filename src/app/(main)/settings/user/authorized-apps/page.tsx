import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserConsents } from '@/lib/actions/oauth'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { AuthorizedAppsClient } from './authorized-apps-client'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

export default async function AuthorizedAppsPage() {
  const t = await getTranslations()
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Load authorized apps
  const consents = await getUserConsents()

  const breadcrumbs = [
    { label: t('nav.dashboard'), href: '/dashboard' },
    { label: t('nav.settings'), href: '/settings' },
    { label: t('settings.userPreferences'), href: '/settings/user' },
    { label: 'Authorized Apps' },
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <AuthorizedAppsClient initialConsents={consents} />
    </>
  )
}
