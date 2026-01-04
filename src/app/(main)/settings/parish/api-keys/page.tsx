import { getCurrentParish } from '@/lib/auth/parish'
import { getUserApiKeys } from '@/lib/actions/mcp-api-keys'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { ApiKeysSettingsClient } from './api-keys-settings-client'
import { checkSettingsAccess } from '@/lib/auth/permissions'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

export default async function ApiKeysSettingsPage() {
  // Check admin permissions (redirects if not authorized)
  await checkSettingsAccess()

  const t = await getTranslations()

  // Get current parish
  const parish = await getCurrentParish()
  if (!parish) {
    redirect('/dashboard')
  }

  // Load API keys for current user
  const apiKeys = await getUserApiKeys()

  const breadcrumbs = [
    { label: t('nav.dashboard'), href: '/dashboard' },
    { label: t('nav.settings'), href: '/settings' },
    { label: t('settings.parishSettings'), href: '/settings/parish/general' },
    { label: 'API Keys' },
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <ApiKeysSettingsClient initialApiKeys={apiKeys} />
    </>
  )
}
