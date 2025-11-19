import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { PageContainer } from "@/components/page-container"
import Link from "next/link"
import {
  VenusAndMars,
  Cross,
  HandHeartIcon,
  BookHeart,
  Users,
  MapPin,
  CalendarDays,
  TrendingUp,
  Sparkles
} from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getWeddings } from "@/lib/actions/weddings"
import { getFunerals } from "@/lib/actions/funerals"
import { getPresentations } from "@/lib/actions/presentations"
import { getQuinceaneras } from "@/lib/actions/quinceaneras"
import { getPeople } from "@/lib/actions/people"
import { getLocations } from "@/lib/actions/locations"
import { getEvents } from "@/lib/actions/events"
import { formatDistance, format } from "date-fns"
import { MiniCalendar } from "@/components/mini-calendar"
import { DashboardErrorHandler } from "./dashboard-error-handler"

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch all data in parallel
  const [
    weddings,
    funerals,
    presentations,
    quinceaneras,
    people,
    locations,
    events
  ] = await Promise.all([
    getWeddings(),
    getFunerals(),
    getPresentations(),
    getQuinceaneras(),
    getPeople(),
    getLocations(),
    getEvents()
  ])

  // Calculate statistics
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  // Total sacraments (for empty state check)
  const totalSacraments = weddings.length + funerals.length + presentations.length + quinceaneras.length

  // Active sacraments (status = 'ACTIVE')
  const activeSacraments = [
    ...weddings.filter(w => w.status === 'ACTIVE'),
    ...funerals.filter(f => f.status === 'ACTIVE'),
    ...presentations.filter(p => p.status === 'ACTIVE'),
    ...quinceaneras.filter(q => q.status === 'ACTIVE')
  ].length

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

  // Sacrament breakdown
  const sacramentBreakdown = [
    { name: 'Weddings', count: weddings.length, icon: VenusAndMars, href: '/weddings' },
    { name: 'Funerals', count: funerals.length, icon: Cross, href: '/funerals' },
    { name: 'Presentations', count: presentations.length, icon: HandHeartIcon, href: '/presentations' },
    { name: 'Quinceañeras', count: quinceaneras.length, icon: BookHeart, href: '/quinceaneras' }
  ]

  // Recent activity - most recently created sacraments (last 5)
  const allSacraments = [
    ...weddings.map(w => ({
      id: w.id,
      type: 'Wedding',
      created_at: w.created_at,
      href: `/weddings/${w.id}`,
      icon: VenusAndMars
    })),
    ...funerals.map(f => ({
      id: f.id,
      type: 'Funeral',
      created_at: f.created_at,
      href: `/funerals/${f.id}`,
      icon: Cross
    })),
    ...presentations.map(p => ({
      id: p.id,
      type: 'Presentation',
      created_at: p.created_at,
      href: `/presentations/${p.id}`,
      icon: HandHeartIcon
    })),
    ...quinceaneras.map(q => ({
      id: q.id,
      type: 'Quinceañera',
      created_at: q.created_at,
      href: `/quinceaneras/${q.id}`,
      icon: BookHeart
    }))
  ]

  const recentSacraments = allSacraments
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sacraments</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSacraments}</div>
            <p className="text-xs text-muted-foreground">
              In preparation now
            </p>
          </CardContent>
        </Card>

        <Link href={`/calendar?view=month&date=${format(now, 'yyyy-MM-dd')}`} className="block hover:opacity-80 transition-opacity">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{scheduledThisMonth}</div>
              <p className="text-xs text-muted-foreground">
                Ceremonies this month
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/people" className="block hover:opacity-80 transition-opacity">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">People Directory</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{people.length}</div>
              <p className="text-xs text-muted-foreground">
                People in your parish
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/locations" className="block hover:opacity-80 transition-opacity">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Locations</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{locations.length}</div>
              <p className="text-xs text-muted-foreground">
                Venues registered
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/events" className="block hover:opacity-80 transition-opacity">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingEvents.length}</div>
              <p className="text-xs text-muted-foreground">
                Events in next 7 days
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Main Content Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {/* Sacrament Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Sacraments by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sacramentBreakdown.map((sacrament) => {
                const Icon = sacrament.icon
                return (
                  <Link
                    key={sacrament.name}
                    href={sacrament.href}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{sacrament.name}</span>
                    </div>
                    <span className="text-2xl font-bold text-muted-foreground">
                      {sacrament.count}
                    </span>
                  </Link>
                )
              })}
              {totalSacraments === 0 && (
                <div className="text-center py-6">
                  <Sparkles className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No sacraments yet. Start by creating your first celebration.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingEvents30Days.length > 0 ? (
              <div className="space-y-3">
                {upcomingEvents30Days.map((event) => (
                  <Link
                    key={event.id}
                    href={`/events/${event.id}`}
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
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentSacraments.length > 0 ? (
              <div className="space-y-3">
                {recentSacraments.map((sacrament) => {
                  const Icon = sacrament.icon
                  return (
                    <Link
                      key={`${sacrament.type}-${sacrament.id}`}
                      href={sacrament.href}
                      className="flex items-start justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-sm">{sacrament.type}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistance(new Date(sacrament.created_at), new Date(), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Sparkles className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-3">
                  No recent activity
                </p>
                <p className="text-xs text-muted-foreground">
                  Create your first sacrament to get started
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mini Calendar */}
        <Card>
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <MiniCalendar events={events} />
          </CardContent>
        </Card>
      </div>

      {/* Quick Access Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Access</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/weddings/create"
              className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:bg-accent transition-colors"
            >
              <VenusAndMars className="h-6 w-6" />
              <span className="text-sm font-medium">New Wedding</span>
            </Link>
            <Link
              href="/funerals/create"
              className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:bg-accent transition-colors"
            >
              <Cross className="h-6 w-6" />
              <span className="text-sm font-medium">New Funeral</span>
            </Link>
            <Link
              href="/presentations/create"
              className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:bg-accent transition-colors"
            >
              <HandHeartIcon className="h-6 w-6" />
              <span className="text-sm font-medium">New Presentation</span>
            </Link>
            <Link
              href="/quinceaneras/create"
              className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:bg-accent transition-colors"
            >
              <BookHeart className="h-6 w-6" />
              <span className="text-sm font-medium">New Quinceañera</span>
            </Link>
          </div>
        </CardContent>
      </Card>
      </PageContainer>
    </>
  )
}
