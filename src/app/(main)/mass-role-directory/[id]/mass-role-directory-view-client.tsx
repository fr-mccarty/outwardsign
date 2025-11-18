'use client'

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, MapPin, Calendar, CalendarX, TrendingUp, Settings, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Person, MassRolePreference, MassRoleBlackoutDate, PersonRoleStats } from "@/lib/types"
import { formatDate } from "@/lib/utils/formatters"

interface MassRoleDirectoryViewClientProps {
  person: Person
  preferences: MassRolePreference[]
  blackoutDates: MassRoleBlackoutDate[]
  stats: PersonRoleStats
}

export function MassRoleDirectoryViewClient({
  person,
  preferences,
  blackoutDates,
  stats
}: MassRoleDirectoryViewClientProps) {
  const activePreferences = preferences.filter(p => p.active)
  const upcomingBlackouts = blackoutDates.filter(
    bd => new Date(bd.end_date) >= new Date()
  )

  return (
    <div className="space-y-6">
      {/* Metadata */}
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <Calendar className="h-3 w-3" />
        Added {formatDate(person.created_at)}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href={`/mass-role-directory/${person.id}/preferences`}>
            <Settings className="h-4 w-4 mr-2" />
            Manage Preferences
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/people/${person.id}`}>
            View Full Profile
          </Link>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Total Assignments</div>
              <div className="text-2xl font-bold">{stats.total_assignments}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">This Month</div>
              <div className="text-2xl font-bold">{stats.assignments_this_month}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">This Year</div>
              <div className="text-2xl font-bold">{stats.assignments_this_year}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Roles</div>
              <div className="text-2xl font-bold">{stats.roles.length}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {upcomingBlackouts.length > 0 && (
        <Card className="border-orange-500/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-medium">Upcoming Unavailability</div>
                <div className="text-sm text-muted-foreground">
                  This person has {upcomingBlackouts.length} upcoming blackout{' '}
                  {upcomingBlackouts.length === 1 ? 'period' : 'periods'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {person.email && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </h4>
                <p className="text-sm">
                  <a href={`mailto:${person.email}`} className="hover:underline">
                    {person.email}
                  </a>
                </p>
              </div>
            )}
            {person.phone_number && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone
                </h4>
                <p className="text-sm">
                  <a href={`tel:${person.phone_number}`} className="hover:underline">
                    {person.phone_number}
                  </a>
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Role Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Role Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          {activePreferences.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No role preferences set</p>
              <Button variant="link" asChild className="mt-2">
                <Link href={`/mass-role-directory/${person.id}/preferences`}>
                  Set preferences
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {activePreferences.map((pref) => (
                <div key={pref.id} className="border-l-2 border-primary pl-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">
                      {pref.mass_role_id ? 'Role-Specific Preferences' : 'General Preferences'}
                    </h4>
                    <Badge variant="secondary">{pref.desired_frequency || 'Not specified'}</Badge>
                  </div>
                  {pref.preferred_days && pref.preferred_days.length > 0 && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Preferred days:</span>{' '}
                      {pref.preferred_days.join(', ')}
                    </div>
                  )}
                  {pref.max_per_month && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Max per month:</span>{' '}
                      {pref.max_per_month}
                    </div>
                  )}
                  {pref.languages && pref.languages.length > 0 && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Languages:</span>{' '}
                      {pref.languages.map(l => `${l.language} (${l.level})`).join(', ')}
                    </div>
                  )}
                  {pref.notes && (
                    <div className="text-sm text-muted-foreground italic">
                      {pref.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Blackout Dates */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarX className="h-5 w-5" />
              Blackout Dates
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {blackoutDates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No blackout dates set</p>
            </div>
          ) : (
            <div className="space-y-3">
              {blackoutDates.map((blackout) => {
                const isPast = new Date(blackout.end_date) < new Date()
                return (
                  <div
                    key={blackout.id}
                    className={`p-3 rounded-lg border ${
                      isPast ? 'bg-muted/50 opacity-60' : 'bg-card'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 flex-1">
                        <div className="font-medium text-sm">
                          {formatDate(blackout.start_date)} -{' '}
                          {formatDate(blackout.end_date)}
                        </div>
                        {blackout.reason && (
                          <div className="text-sm text-muted-foreground">
                            {blackout.reason}
                          </div>
                        )}
                      </div>
                      {isPast && (
                        <Badge variant="secondary" className="text-xs">
                          Past
                        </Badge>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Last Assignment */}
      {stats.last_assignment_date && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <span className="text-muted-foreground">Last assignment:</span>{' '}
              {formatDate(stats.last_assignment_date)}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Address (if available) */}
      {(person.street || person.city || person.state || person.zipcode) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {person.street && <p>{person.street}</p>}
              {(person.city || person.state || person.zipcode) && (
                <p>
                  {person.city}{person.city && (person.state || person.zipcode) ? ', ' : ''}
                  {person.state} {person.zipcode}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
