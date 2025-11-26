import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getCurrentParish } from '@/lib/auth/parish'
import { getParishSettings } from '@/lib/actions/setup'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { ParishGeneralSettingsClient } from './parish-general-settings-client'

export const dynamic = 'force-dynamic'

export default async function ParishGeneralSettingsPage() {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Get current parish
  const parish = await getCurrentParish()
  if (!parish) {
    redirect('/dashboard')
  }

  // Load parish settings
  const settingsResult = await getParishSettings(parish.id)

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Settings", href: "/settings" },
    { label: "Parish Settings", href: "/settings/parish/general" },
    { label: "General" }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <ParishGeneralSettingsClient
        parish={parish}
        parishSettings={settingsResult.settings}
      />
    </>
  )
}
