import { PageContainer } from "@/components/page-container"
import { MetricCard } from "@/components/metric-card"
import { FormSectionCard } from "@/components/form-section-card"
import Link from "next/link"
import {
  Users,
  MapPin,
  CalendarDays,
  TrendingUp,
  Sparkles,
  CirclePlus,
  Heart,
  CalendarCheck
} from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getPeople } from "@/lib/actions/people"
import { getLocations } from "@/lib/actions/locations"
import { getEvents } from "@/lib/actions/events"
import { format } from "date-fns"
import { MiniCalendar } from "@/components/mini-calendar"
import { DashboardErrorHandler } from "./dashboard-error-handler"
import { getDynamicEvents } from "@/lib/actions/dynamic-events"

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch all data in parallel
  const [
    people,
    locations,
    events,
    dynamicEvents
  ] = await Promise.all([
    getPeople(),
    getLocations(),
    getEvents(),
    getDynamicEvents()
  ])

  // Calculate statistics
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  // Scheduled this month (events with start_date in current month)
  const scheduledThisMonth = events.filter(e => {
    if (!e.start_date) return false
    const eventDate = new Date(e.start_date)
    return eventDate >= startOfMonth && eventDate <= endOfMonth
  }).length

  // Upcoming events (next 7 days)
  const sevenDaysFromNow = new Date()
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
  const upcomingEvents = events.filter(e => {
    if (!e.start_date) return false
    const eventDate = new Date(e.start_date)
    return eventDate >= now && eventDate <= sevenDaysFromNow
  })

  // Upcoming events (next 30 days)
  const upcomingEvents30Days = events
    .filter(e => {
      if (!e.start_date) return false
      const eventDate = new Date(e.start_date)
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
      return eventDate >= now && eventDate <= thirtyDaysFromNow
    })
    .sort((a, b) => new Date(a.start_date!).getTime() - new Date(b.start_date!).getTime())
    .slice(0, 5)

  return (
    <>
      <DashboardErrorHandler />
      <PageContainer
        title="Dashboard"
        description="Your sacramental ministry at a glance"
        data-testid="dashboard-page"
      >
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <MetricCard
          title="Dynamic Events"
          value={dynamicEvents.length}
          description="Total events created"
          icon={Sparkles}
        />

        <Link href={`/calendar?view=month&date=${format(now, 'yyyy-MM-dd')}`} className="block hover:opacity-80 transition-opacity">
          <MetricCard
            title="Scheduled This Month"
            value={scheduledThisMonth}
            description="Ceremonies this month"
            icon={TrendingUp}
          />
        </Link>

        <Link href="/people" className="block hover:opacity-80 transition-opacity">
          <MetricCard
            title="People Directory"
            value={people.length}
            description="People in your parish"
            icon={Users}
          />
        </Link>

        <Link href="/locations" className="block hover:opacity-80 transition-opacity">
          <MetricCard
            title="Locations"
            value={locations.length}
            description="Venues registered"
            icon={MapPin}
          />
        </Link>

        <Link href="/events" className="block hover:opacity-80 transition-opacity">
          <MetricCard
            title="This Week"
            value={upcomingEvents.length}
            description="Events in next 7 days"
            icon={CalendarDays}
          />
        </Link>
      </div>

      {/* Main Content Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {/* Upcoming Events */}
        <FormSectionCard title="Upcoming Events">
          {upcomingEvents30Days.length > 0 ? (
            <div className="space-y-3">
              {upcomingEvents30Days.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.event_type_id}/${event.id}`}
                  className="flex items-start justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-1">{event.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {event.start_date && new Date(event.start_date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                      {event.start_time && ` at ${event.start_time}`}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarDays className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-3">
                No upcoming events in the next 30 days
              </p>
              <Link
                href="/events/create"
                className="text-sm text-primary hover:underline"
              >
                Schedule an event
              </Link>
            </div>
          )}
        </FormSectionCard>

        {/* Dynamic Events Summary */}
        <FormSectionCard title="Recent Dynamic Events">
          {dynamicEvents.length > 0 ? (
            <div className="space-y-3">
              {dynamicEvents.slice(0, 5).map((dynEvent) => (
                <div
                  key={dynEvent.id}
                  className="p-3 border rounded-lg"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-sm">{dynEvent.event_type?.name || 'Event'}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Created {new Date(dynEvent.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Sparkles className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-3">
                No dynamic events yet
              </p>
              <p className="text-xs text-muted-foreground">
                Create your first event type in Settings
              </p>
            </div>
          )}
        </FormSectionCard>

        {/* Mini Calendar */}
        <FormSectionCard title="Calendar" contentClassName="p-3 pt-0">
          <MiniCalendar events={events} />
        </FormSectionCard>
      </div>

      {/* Quick Access Links */}
      <FormSectionCard title="Quick Access">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <Link
            href="/masses/create"
            className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:bg-accent transition-colors"
          >
            <CirclePlus className="h-6 w-6" />
            <span className="text-sm font-medium text-center">New Mass</span>
          </Link>
          <Link
            href="/masses/schedule"
            className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:bg-accent transition-colors"
          >
            <CalendarCheck className="h-6 w-6" />
            <span className="text-sm font-medium text-center">Schedule Masses</span>
          </Link>
          <Link
            href="/events/create"
            className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:bg-accent transition-colors"
          >
            <CalendarDays className="h-6 w-6" />
            <span className="text-sm font-medium text-center">New Event</span>
          </Link>
          <Link
            href="/mass-intentions/create"
            className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:bg-accent transition-colors"
          >
            <Heart className="h-6 w-6" />
            <span className="text-sm font-medium text-center">New Mass Intention</span>
          </Link>
        </div>
      </FormSectionCard>
      </PageContainer>
    </>
  )
}
