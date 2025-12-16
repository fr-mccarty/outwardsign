import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { ModuleCreateButton } from '@/components/module-create-button'
import { getStandaloneCalendarEvents } from "@/lib/actions/calendar-events"
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CalendarEventsListClient } from './calendar-events-list-client'

export const dynamic = 'force-dynamic'

export default async function CalendarEventsPage() {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch standalone calendar events server-side
  const calendarEvents = await getStandaloneCalendarEvents()

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Calendar Events" }
  ]

  return (
    <PageContainer
      title="Calendar Events"
      description="Standalone parish events and activities."
      primaryAction={<ModuleCreateButton moduleName="Calendar Event" href="/calendar-events/create" />}
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <CalendarEventsListClient initialData={calendarEvents} />
    </PageContainer>
  )
}
