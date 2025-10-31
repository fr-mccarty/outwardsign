import { PageContainer } from "@/components/page-container"
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { getEvent } from "@/lib/actions/events"
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { EventForm } from '../../event-form'

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
    <PageContainer
      title="Edit Event"
      description="Update the event details."
      cardTitle="Event Details"
      maxWidth="4xl"
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <EventForm event={event} />
    </PageContainer>
  )
}
