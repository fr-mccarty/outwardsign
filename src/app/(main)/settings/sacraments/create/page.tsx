import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { SacramentCreateClient } from './sacrament-create-client'
import { getTranslations } from 'next-intl/server'

export default async function CreateSacramentPage() {
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
    { label: t('nav.sacraments'), href: '/settings/sacraments' },
    { label: t('common.create'), href: '/settings/sacraments/create' },
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <SacramentCreateClient />
    </>
  )
}
