import { PageContainer } from "@/components/page-container"
import { MetricCard } from "@/components/metric-card"
import { FormSectionCard } from "@/components/form-section-card"
import Link from "next/link"
import {
  Users,
  MapPin,
  CalendarDays,
  TrendingUp,
  CirclePlus,
  Heart,
  CalendarCheck,
  Plus
} from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getPeople } from "@/lib/actions/people"
import { getLocations } from "@/lib/actions/locations"
import { getEvents } from "@/lib/actions/events"
import { format } from "date-fns"
import { MiniCalendar } from "@/components/mini-calendar"
import { DashboardErrorHandler } from "./dashboard-error-handler"
import { getAllDynamicEvents } from "@/lib/actions/dynamic-events"
import { getActiveEventTypes } from "@/lib/actions/event-types"
import { getLucideIcon } from "@/lib/utils/lucide-icons"
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const t = await getTranslations()
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
    dynamicEvents,
    eventTypes
  ] = await Promise.all([
    getPeople(),
    getLocations(),
    getEvents(),
    getAllDynamicEvents({ limit: 50 }),
    getActiveEventTypes()
  ])

  // Calculate statistics
  const now = new Date()
  const todayString = format(now, 'yyyy-MM-dd')
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const startOfMonthString = format(startOfMonth, 'yyyy-MM-dd')
  const endOfMonthString = format(endOfMonth, 'yyyy-MM-dd')

  // Scheduled this month (events with start_date in current month - old system)
  const scheduledThisMonthOld = events.filter(e => {
    if (!e.start_date) return false
    const eventDate = new Date(e.start_date)
    return eventDate >= startOfMonth && eventDate <= endOfMonth
  }).length

  // Dynamic events scheduled this month (based on primary occasion date)
  const scheduledThisMonthDynamic = dynamicEvents.filter(e => {
    const date = e.primary_occasion?.date
    if (!date) return false
    return date >= startOfMonthString && date <= endOfMonthString
  }).length

  const scheduledThisMonth = scheduledThisMonthOld + scheduledThisMonthDynamic

  // Upcoming events (next 7 days) - old system
  const sevenDaysFromNow = new Date()
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
  const sevenDaysString = format(sevenDaysFromNow, 'yyyy-MM-dd')

  const upcomingEventsOld = events.filter(e => {
    if (!e.start_date) return false
    const eventDate = new Date(e.start_date)
    return eventDate >= now && eventDate <= sevenDaysFromNow
  })

  // Dynamic events upcoming (next 7 days)
  const upcomingDynamicEvents = dynamicEvents.filter(e => {
    const date = e.primary_occasion?.date
    if (!date) return false
    return date >= todayString && date <= sevenDaysString
  })

  const upcomingEventsCount = upcomingEventsOld.length + upcomingDynamicEvents.length

  // Upcoming dynamic events (next 30 days) with primary occasion
  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
  const thirtyDaysString = format(thirtyDaysFromNow, 'yyyy-MM-dd')

  const upcomingDynamicEvents30Days = dynamicEvents
    .filter(e => {
      const date = e.primary_occasion?.date
      if (!date) return false
      return date >= todayString && date <= thirtyDaysString
    })
    .sort((a, b) => {
      const dateA = a.primary_occasion?.date || ''
      const dateB = b.primary_occasion?.date || ''
      return dateA.localeCompare(dateB)
    })
    .slice(0, 5)

  // Count events by event type
  const eventCountsByType = new Map<string, number>()
  for (const event of dynamicEvents) {
    const typeId = event.event_type_id
    eventCountsByType.set(typeId, (eventCountsByType.get(typeId) || 0) + 1)
  }

  return (
    <>
      <DashboardErrorHandler />
      <PageContainer
        title={t('dashboard.title')}
        description={t('dashboard.description')}
        data-testid="dashboard-page"
      >
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Link href="/events" className="block hover:opacity-80 transition-opacity">
          <MetricCard
            title={t('dashboard.totalEvents')}
            value={dynamicEvents.length}
            description={t('dashboard.eventsCreated')}
            icon={CalendarDays}
          />
        </Link>

        <Link href={`/calendar?view=month&date=${format(now, 'yyyy-MM-dd')}`} className="block hover:opacity-80 transition-opacity">
          <MetricCard
            title={t('dashboard.scheduledThisMonth')}
            value={scheduledThisMonth}
            description={t('dashboard.ceremoniesThisMonth')}
            icon={TrendingUp}
          />
        </Link>

        <Link href="/people" className="block hover:opacity-80 transition-opacity">
          <MetricCard
            title={t('dashboard.peopleDirectory')}
            value={people.length}
            description={t('dashboard.peopleInParish')}
            icon={Users}
          />
        </Link>

        <Link href="/locations" className="block hover:opacity-80 transition-opacity">
          <MetricCard
            title={t('dashboard.locations')}
            value={locations.length}
            description={t('dashboard.venuesRegistered')}
            icon={MapPin}
          />
        </Link>

        <Link href="/events" className="block hover:opacity-80 transition-opacity">
          <MetricCard
            title={t('dashboard.thisWeek')}
            value={upcomingEventsCount}
            description={t('dashboard.eventsNextSevenDays')}
            icon={CalendarCheck}
          />
        </Link>
      </div>

      {/* Event Types Summary - Only show if event types exist */}
      {eventTypes.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
          {eventTypes.map((eventType) => {
            const Icon = getLucideIcon(eventType.icon)
            const count = eventCountsByType.get(eventType.id) || 0
            const slug = eventType.slug || eventType.id
            return (
              <Link
                key={eventType.id}
                href={`/events?type=${slug}`}
                className="block hover:opacity-80 transition-opacity"
              >
                <MetricCard
                  title={eventType.name}
                  value={count}
                  description={count === 1 ? t('dashboard.event') : t('dashboard.events')}
                  icon={Icon}
                />
              </Link>
            )
          })}
        </div>
      )}

      {/* Main Content Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {/* Upcoming Events */}
        <FormSectionCard title={t('dashboard.upcomingEvents')}>
          {upcomingDynamicEvents30Days.length > 0 ? (
            <div className="space-y-3">
              {upcomingDynamicEvents30Days.map((event) => {
                const Icon = event.event_type ? getLucideIcon(event.event_type.icon) : CalendarDays
                const slug = event.event_type?.slug || event.event_type_id
                return (
                  <Link
                    key={event.id}
                    href={`/events/${slug}/${event.id}`}
                    className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <Icon className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-1">
                        {event.event_type?.name || 'Event'}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {event.primary_occasion?.date && new Date(event.primary_occasion.date + 'T00:00:00').toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                        {event.primary_occasion?.time && ` at ${event.primary_occasion.time.slice(0, 5)}`}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarDays className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-3">
                {t('dashboard.noUpcomingEvents')}
              </p>
              <Link
                href="/events/create"
                className="text-sm text-primary hover:underline"
              >
                {t('dashboard.scheduleAnEvent')}
              </Link>
            </div>
          )}
        </FormSectionCard>

        {/* Recent Events */}
        <FormSectionCard title={t('dashboard.recentlyCreated')}>
          {dynamicEvents.length > 0 ? (
            <div className="space-y-3">
              {dynamicEvents.slice(0, 5).map((dynEvent) => {
                const Icon = dynEvent.event_type ? getLucideIcon(dynEvent.event_type.icon) : CalendarDays
                const slug = dynEvent.event_type?.slug || dynEvent.event_type_id
                return (
                  <Link
                    key={dynEvent.id}
                    href={`/events/${slug}/${dynEvent.id}`}
                    className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <Icon className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-sm">{dynEvent.event_type?.name || 'Event'}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {dynEvent.primary_occasion?.date
                          ? new Date(dynEvent.primary_occasion.date + 'T00:00:00').toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })
                          : `Created ${new Date(dynEvent.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}`
                        }
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarDays className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-3">
                {t('dashboard.noEventsYet')}
              </p>
              {eventTypes.length > 0 ? (
                <Link
                  href="/events/create"
                  className="text-sm text-primary hover:underline"
                >
                  {t('dashboard.createYourFirstEvent')}
                </Link>
              ) : (
                <Link
                  href="/settings/event-types"
                  className="text-sm text-primary hover:underline"
                >
                  {t('dashboard.setUpEventTypesFirst')}
                </Link>
              )}
            </div>
          )}
        </FormSectionCard>

        {/* Mini Calendar */}
        <FormSectionCard title={t('dashboard.calendar')} contentClassName="p-3 pt-0">
          <MiniCalendar events={events} />
        </FormSectionCard>
      </div>

      {/* Quick Access Links */}
      <FormSectionCard title={t('dashboard.quickAccess')}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {/* Dynamic Event Type Quick Links */}
          {eventTypes.map((eventType) => {
            const Icon = getLucideIcon(eventType.icon)
            const slug = eventType.slug || eventType.id
            return (
              <Link
                key={eventType.id}
                href={`/events/create?type=${slug}`}
                className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:bg-accent transition-colors"
              >
                <Icon className="h-6 w-6" />
                <span className="text-sm font-medium text-center">New {eventType.name}</span>
              </Link>
            )
          })}

          {/* Static Quick Links */}
          <Link
            href="/masses/create"
            className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:bg-accent transition-colors"
          >
            <CirclePlus className="h-6 w-6" />
            <span className="text-sm font-medium text-center">{t('dashboard.newMass')}</span>
          </Link>
          <Link
            href="/masses/schedule"
            className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:bg-accent transition-colors"
          >
            <CalendarCheck className="h-6 w-6" />
            <span className="text-sm font-medium text-center">{t('dashboard.scheduleMasses')}</span>
          </Link>
          <Link
            href="/mass-intentions/create"
            className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:bg-accent transition-colors"
          >
            <Heart className="h-6 w-6" />
            <span className="text-sm font-medium text-center">{t('dashboard.newMassIntention')}</span>
          </Link>
          <Link
            href="/people/create"
            className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:bg-accent transition-colors"
          >
            <Plus className="h-6 w-6" />
            <span className="text-sm font-medium text-center">{t('dashboard.newPerson')}</span>
          </Link>
        </div>
      </FormSectionCard>
      </PageContainer>
    </>
  )
}
