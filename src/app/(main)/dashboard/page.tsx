import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageContainer } from "@/components/page-container"
import Link from "next/link"
import { Plus, FileText, TrendingUp, UserCheck, ClipboardList, Calendar as CalendarIcon, Library } from "lucide-react"
import { getPetitions } from "@/lib/actions/petitions"
import { getMinisters } from "@/lib/actions/ministers"
import { getLiturgyPlans } from "@/lib/actions/liturgy-planning"
import { getUpcomingEvents } from "@/lib/actions/calendar"
import { getReadings } from "@/lib/actions/readings"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  const recentPetitions = await getPetitions()
  const ministers = await getMinisters()
  const liturgyPlans = await getLiturgyPlans()
  const upcomingEvents = await getUpcomingEvents(5)
  const readings = await getReadings()
  
  const recentPetitionsCount = recentPetitions.slice(0, 3)
  const activeMinisters = ministers.filter(m => m.is_active)
  const recentLiturgyPlans = liturgyPlans.slice(0, 3)
  const userReadings = readings

  return (
    <PageContainer 
      title="Dashboard" 
      description="Welcome back! Here's an overview of your liturgical management platform."
      maxWidth="7xl"
    >
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Petitions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentPetitions.length}</div>
            <p className="text-xs text-muted-foreground">
              Lifetime petitions created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recentPetitions.filter(p => {
                const petitionDate = new Date(p.created_at)
                const now = new Date()
                return petitionDate.getMonth() === now.getMonth() && 
                       petitionDate.getFullYear() === now.getFullYear()
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Petitions this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Ministers</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeMinisters.length}</div>
            <p className="text-xs text-muted-foreground">
              Ready to serve
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Liturgy Plans</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{liturgyPlans.length}</div>
            <p className="text-xs text-muted-foreground">
              Total celebrations planned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reading Collections</CardTitle>
            <Library className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userReadings.length}</div>
            <p className="text-xs text-muted-foreground">
              Personal collections created
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full justify-start" size="sm">
              <Link href="/petitions/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Petition
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start" size="sm">
              <Link href="/liturgy-planning/create">
                <ClipboardList className="h-4 w-4 mr-2" />
                Plan Liturgy
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start" size="sm">
              <Link href="/ministers/create">
                <UserCheck className="h-4 w-4 mr-2" />
                Add Minister
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start" size="sm">
              <Link href="/calendar/create">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Add Event
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start" size="sm">
              <Link href="/readings/create">
                <Library className="h-4 w-4 mr-2" />
                New Reading Collection
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length > 0 ? (
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-2 border rounded-lg">
                    <div>
                      <h4 className="font-medium text-sm line-clamp-1">{event.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.date).toLocaleDateString()}
                      </p>
                    </div>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/calendar/${event.id}`}>
                        View
                      </Link>
                    </Button>
                  </div>
                ))}
                <Button asChild variant="outline" className="w-full" size="sm">
                  <Link href="/calendar">
                    View Full Calendar
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <CalendarIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-3">
                  No upcoming events
                </p>
                <Button asChild size="sm">
                  <Link href="/calendar/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Event
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPetitionsCount.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Recent Petitions</h4>
                  <div className="space-y-2">
                    {recentPetitionsCount.map((petition) => (
                      <div key={petition.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="font-medium text-sm line-clamp-1">{petition.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(petition.date).toLocaleDateString()}
                          </p>
                        </div>
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/petitions/${petition.id}`}>
                            View
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {recentLiturgyPlans.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Recent Liturgy Plans</h4>
                  <div className="space-y-2">
                    {recentLiturgyPlans.map((plan) => (
                      <div key={plan.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="font-medium text-sm line-clamp-1">{plan.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(plan.date).toLocaleDateString()}
                          </p>
                        </div>
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/liturgy-planning/${plan.id}`}>
                            View
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {recentPetitionsCount.length === 0 && recentLiturgyPlans.length === 0 && (
                <div className="text-center py-6">
                  <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-3">
                    No recent activity
                  </p>
                  <Button asChild size="sm">
                    <Link href="/petitions/create">
                      <Plus className="h-4 w-4 mr-2" />
                      Get Started
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Smart Petitions
              </h4>
              <p className="text-sm text-muted-foreground">
                Generate liturgical petitions with AI assistance following traditional Catholic formats.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                Liturgy Planning
              </h4>
              <p className="text-sm text-muted-foreground">
                Plan complete celebrations with prayers, prefaces, readings, and special instructions.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                Ministers Directory
              </h4>
              <p className="text-sm text-muted-foreground">
                Manage contact information and availability for all ministers and volunteers.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Liturgical Calendar
              </h4>
              <p className="text-sm text-muted-foreground">
                Track feast days, special celebrations, and liturgical seasons throughout the year.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Library className="h-4 w-4" />
                Reading Collections
              </h4>
              <p className="text-sm text-muted-foreground">
                Organize pre-assembled sets of readings for weddings, funerals, and other occasions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  )
}