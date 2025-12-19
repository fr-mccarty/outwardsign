import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PersonFormWrapper } from '../person-form-wrapper'
import { getTranslations } from 'next-intl/server'

export default async function CreatePersonPage() {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const t = await getTranslations()

  const breadcrumbs = [
    { label: t('nav.dashboard'), href: "/dashboard" },
    { label: t('nav.ourPeople'), href: "/people" },
    { label: t('breadcrumbs.create') }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <PersonFormWrapper
        title="Create Person"
        description="Add a new person to your parish directory."
      />
    </>
  )
}
