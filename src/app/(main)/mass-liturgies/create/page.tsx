import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MassLiturgyFormWrapper } from '../mass-liturgy-form-wrapper'
import { getLiturgicalCalendarEvent } from '@/lib/actions/liturgical-calendar'
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
    initialLiturgicalEvent = await getLiturgicalCalendarEvent(liturgicalEventId)
  }

  const t = await getTranslations()

  const breadcrumbs = [
    { label: t('nav.dashboard'), href: "/dashboard" },
    { label: t('nav.masses'), href: "/mass-liturgies" },
    { label: t('breadcrumbs.create') }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <MassLiturgyFormWrapper
        title="Create Mass"
        description="Add a new Mass celebration to your parish."
        initialLiturgicalEvent={initialLiturgicalEvent}
      />
    </>
  )
}
