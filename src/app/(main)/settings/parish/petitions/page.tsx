import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getCurrentParish } from '@/lib/auth/parish'
import { getPetitionTemplates } from '@/lib/actions/petition-templates'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { ParishPetitionsSettingsClient } from './parish-petitions-settings-client'

export const dynamic = 'force-dynamic'

export default async function ParishPetitionsSettingsPage() {
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

  // Load petition templates
  const petitionTemplates = await getPetitionTemplates()

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Settings", href: "/settings" },
    { label: "Parish Settings", href: "/settings/parish/general" },
    { label: "Petitions" }
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
