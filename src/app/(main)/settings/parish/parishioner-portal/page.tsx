import { getCurrentParish } from '@/lib/auth/parish'
import {
  getParishionerPortalStats,
  getActiveParishionerSessions,
  getPortalEnabledParishioners,
} from '@/lib/actions/parishioner-portal'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { ParishionerPortalSettingsClient } from './parishioner-portal-settings-client'
import { checkSettingsAccess } from '@/lib/auth/permissions'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

export default async function ParishionerPortalSettingsPage() {
  // Check admin permissions (redirects if not authorized)
  await checkSettingsAccess()

  const t = await getTranslations()

  // Get current parish
  const parish = await getCurrentParish()
  if (!parish) {
    redirect('/dashboard')
  }

  // Load portal data in parallel
  const [stats, sessions, parishioners] = await Promise.all([
    getParishionerPortalStats(),
    getActiveParishionerSessions(),
    getPortalEnabledParishioners(),
  ])

  const breadcrumbs = [
    { label: t('nav.dashboard'), href: '/dashboard' },
    { label: t('nav.settings'), href: '/settings' },
    { label: t('settings.parishSettings'), href: '/settings/parish' },
    { label: 'Parishioner Portal' },
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <ParishionerPortalSettingsClient
        initialStats={stats}
        initialSessions={sessions}
        initialParishioners={parishioners}
      />
    </>
  )
}
