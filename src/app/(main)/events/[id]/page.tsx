import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react'
import { getEventWithRelations } from "@/lib/actions/events"
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { EVENT_TYPE_LABELS } from "@/lib/constants"
import { EventViewClient } from './event-view-client'
import { EventActionsClient } from './event-actions-client'
import { getEventModuleReference } from '@/lib/helpers/event-helpers'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EventDetailPage({ params }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { id } = await params

  // Fetch event server-side with relations
  const event = await getEventWithRelations(id)

  if (!event) {
    notFound()
  }

  // Fetch module reference if this event is linked to a module
  const moduleReference = await getEventModuleReference(event)

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Our Events", href: "/events" },
    { label: event.name }
  ]

  const actions = (
    <>
      <Button variant="outline" asChild>
        <Link href={`/events/${event.id}/edit`}>
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </Link>
      </Button>
      <EventActionsClient
        eventId={event.id}
        eventName={event.name}
        startDate={event.start_date}
      />
    </>
  )

  return (
    <PageContainer
      title={event.name}
      description={EVENT_TYPE_LABELS[event.event_type]?.en || event.event_type}
      maxWidth="4xl"
      actions={actions}
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <EventViewClient event={event} moduleReference={moduleReference} />
    </PageContainer>
  )
}
