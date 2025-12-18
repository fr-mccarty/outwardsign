import { getCurrentParish } from '@/lib/auth/parish'
import { getParishSettings } from '@/lib/actions/setup'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { ParishMassIntentionsSettingsClient } from './parish-mass-intentions-settings-client'
import { checkSettingsAccess } from '@/lib/auth/permissions'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

export default async function ParishMassIntentionsSettingsPage() {
  // Check admin permissions (redirects if not authorized)
  await checkSettingsAccess()

  const t = await getTranslations()

  // Get current parish
  const parish = await getCurrentParish()
  if (!parish) {
    redirect('/dashboard')
  }

  // Load parish settings
  const settingsResult = await getParishSettings(parish.id)

  const breadcrumbs = [
    { label: t('nav.dashboard'), href: '/dashboard' },
    { label: t('nav.settings'), href: '/settings' },
    { label: t('settings.parishSettings'), href: '/settings/parish/general' },
    { label: t('settings.parish.massIntentions') }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <ParishMassIntentionsSettingsClient
        parish={parish}
        parishSettings={settingsResult.settings}
      />
    </>
  )
}
