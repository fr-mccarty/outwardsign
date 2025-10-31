import { PageContainer } from "@/components/page-container"
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EventForm } from '../event-form'

export default async function CreateEventPage() {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Events", href: "/events" },
    { label: "Create Event" }
  ]

  return (
    <PageContainer
      title="Create Event"
      description="Add a new event to your parish calendar."
      cardTitle="Event Details"
      maxWidth="4xl"
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <EventForm />
    </PageContainer>
  )
}
