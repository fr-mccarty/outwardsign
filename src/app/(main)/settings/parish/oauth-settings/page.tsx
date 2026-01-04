import { getCurrentParish } from '@/lib/auth/parish'
import {
  getParishOAuthSettings,
  getParishUserOAuthPermissions,
  getParishActiveTokens,
} from '@/lib/actions/oauth'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { OAuthSettingsClient } from './oauth-settings-client'
import { checkSettingsAccess } from '@/lib/auth/permissions'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

export default async function OAuthSettingsPage() {
  // Check admin permissions (redirects if not authorized)
  await checkSettingsAccess()

  const t = await getTranslations()

  // Get current parish
  const parish = await getCurrentParish()
  if (!parish) {
    redirect('/dashboard')
  }

  // Load OAuth settings and data
  const [settings, userPermissions, activeTokens] = await Promise.all([
    getParishOAuthSettings(),
    getParishUserOAuthPermissions(),
    getParishActiveTokens(),
  ])

  const breadcrumbs = [
    { label: t('nav.dashboard'), href: '/dashboard' },
    { label: t('nav.settings'), href: '/settings' },
    { label: t('settings.parishSettings'), href: '/settings/parish/general' },
    { label: 'OAuth Settings' },
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <OAuthSettingsClient
        initialSettings={settings}
        initialUserPermissions={userPermissions}
        initialActiveTokens={activeTokens}
      />
    </>
  )
}
