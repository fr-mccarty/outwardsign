import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getEventWithRelations, computeMasterEventTitle } from '@/lib/actions/master-events'
import { EventFormWrapper } from '../../event-form-wrapper'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditEventPage({ params }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { id } = await params
  const event = await getEventWithRelations(id)

  if (!event) {
    notFound()
  }

  // Build dynamic title from computeMasterEventTitle
  const title = await computeMasterEventTitle(event)

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Events", href: "/events" },
    { label: "Edit" }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <EventFormWrapper
        event={event}
        title={title}
        description="Update event information."
      />
    </>
  )
}
