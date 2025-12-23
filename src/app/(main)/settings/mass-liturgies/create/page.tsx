import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { MassLiturgyCreateClient } from './mass-liturgy-create-client'
import { getTranslations } from 'next-intl/server'

export default async function CreateMassPage() {
  const t = await getTranslations()
  const supabase = await createClient()

  // Check authentication server-side
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const breadcrumbs = [
    { label: t('nav.dashboard'), href: '/dashboard' },
    { label: t('nav.settings'), href: '/settings' },
    { label: t('nav.masses'), href: '/settings/mass-liturgies' },
    { label: t('common.create'), href: '/settings/mass-liturgies/create' },
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <MassLiturgyCreateClient />
    </>
  )
}
