import { Button } from "@/components/ui/button"
import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import Link from "next/link"
import { Plus } from "lucide-react"
import { getEvents, getEventsWithModuleLinks, type EventFilterParams } from "@/lib/actions/events"
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EventsListClient } from './events-list-client'

interface PageProps {
  searchParams: Promise<{
    search?: string
    event_type?: string
    language?: string
    start_date?: string
    end_date?: string
    sort?: string
  }>
}

export default async function EventsPage({ searchParams }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const params = await searchParams

  // Build filters from search params
  const filters: EventFilterParams = {
    search: params.search,
    event_type: params.event_type as EventFilterParams['event_type'],
    language: params.language as EventFilterParams['language'],
    start_date: params.start_date,
    end_date: params.end_date,
    sort: params.sort
  }

  // Fetch events server-side with filters and module links
  const events = await getEventsWithModuleLinks(filters)

  // Compute stats server-side
  const allEvents = await getEvents()
  const eventTypes = [...new Set(allEvents.map(e => e.event_type).filter(Boolean))] as string[]
  const languages = [...new Set(allEvents.map(e => e.language).filter(Boolean))] as string[]

  const now = new Date()
  const upcomingEvents = allEvents.filter(e => {
    if (!e.start_date) return false
    return new Date(e.start_date) >= now
  })

  const stats = {
    total: allEvents.length,
    upcoming: upcomingEvents.length,
    past: allEvents.length - upcomingEvents.length,
    filtered: events.length,
    eventTypes,
    languages
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Our Events" }
  ]

  return (
    <PageContainer
      title="Our Events"
      description="Manage parish events and activities."
      actions={
        <Button asChild>
          <Link href="/events/create">
            <Plus className="h-4 w-4 mr-2" />
            New Event
          </Link>
        </Button>
      }
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <EventsListClient initialData={events} stats={stats} />
    </PageContainer>
  )
}
