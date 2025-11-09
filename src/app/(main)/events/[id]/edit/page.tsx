import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { getEvent } from "@/lib/actions/events"
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
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

  // Fetch event server-side
  const event = await getEvent(id)

  if (!event) {
    notFound()
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Events", href: "/events" },
    { label: event.name, href: `/events/${id}` },
    { label: "Edit" }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <EventFormWrapper
        event={event}
        title="Edit Event"
        description="Update the event details."
        saveButtonLabel="Save Changes"
      />
    </>
  )
}
