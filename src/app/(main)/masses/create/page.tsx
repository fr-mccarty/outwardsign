import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MassFormWrapper } from '../mass-form-wrapper'
import { getGlobalLiturgicalEvent } from '@/lib/actions/global-liturgical-events'
import { getTranslations } from 'next-intl/server'

interface PageProps {
  searchParams: Promise<{ liturgical_event_id?: string }>
}

export default async function CreateMassPage({ searchParams }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Read URL params (Next.js 15 requires awaiting searchParams)
  const params = await searchParams
  const liturgicalEventId = params.liturgical_event_id

  // Fetch liturgical event if ID is provided
  let initialLiturgicalEvent = null
  if (liturgicalEventId) {
    initialLiturgicalEvent = await getGlobalLiturgicalEvent(liturgicalEventId)
  }

  const t = await getTranslations()

  const breadcrumbs = [
    { label: t('nav.dashboard'), href: "/dashboard" },
    { label: t('nav.masses'), href: "/masses" },
    { label: t('breadcrumbs.create') }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <MassFormWrapper
        title="Create Mass"
        description="Add a new Mass celebration to your parish."
        initialLiturgicalEvent={initialLiturgicalEvent}
      />
    </>
  )
}
