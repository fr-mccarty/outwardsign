import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getEventWithRelations, computeMasterEventTitle } from '@/lib/actions/master-events'
import { MassLiturgyFormWrapper } from '../../mass-liturgy-form-wrapper'
import { getTranslations } from 'next-intl/server'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditMassPage({ params }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { id } = await params
  const mass = await getEventWithRelations(id)

  if (!mass) {
    notFound()
  }

  // Build dynamic title from computeMasterEventTitle
  const title = await computeMasterEventTitle(mass)

  const t = await getTranslations()

  const breadcrumbs = [
    { label: t('nav.dashboard'), href: "/dashboard" },
    { label: t('nav.masses'), href: "/mass-liturgies" },
    { label: t('breadcrumbs.edit') }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <MassLiturgyFormWrapper
        mass={mass as any} // TODO: Update MassLiturgyFormWrapper to work with MasterEventWithRelations
        title={title}
        description="Update Mass information."
      />
    </>
  )
}
