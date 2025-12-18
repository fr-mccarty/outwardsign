import { getCurrentParish } from '@/lib/auth/parish'
import { getPetitionTemplates } from '@/lib/actions/petition-templates'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { ParishPetitionsSettingsClient } from './parish-petitions-settings-client'
import { checkSettingsAccess } from '@/lib/auth/permissions'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

export default async function ParishPetitionsSettingsPage() {
  // Check admin permissions (redirects if not authorized)
  await checkSettingsAccess()

  const t = await getTranslations()

  // Get current parish
  const parish = await getCurrentParish()
  if (!parish) {
    redirect('/dashboard')
  }

  // Load petition templates
  const petitionTemplates = await getPetitionTemplates()

  const breadcrumbs = [
    { label: t('nav.dashboard'), href: '/dashboard' },
    { label: t('nav.settings'), href: '/settings' },
    { label: t('settings.parishSettings'), href: '/settings/parish/general' },
    { label: t('settings.parish.petitions') }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <ParishPetitionsSettingsClient
        parish={parish}
        initialPetitionTemplates={petitionTemplates}
      />
    </>
  )
}
