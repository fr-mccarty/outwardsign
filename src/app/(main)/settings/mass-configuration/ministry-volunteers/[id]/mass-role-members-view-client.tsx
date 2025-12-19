'use client'

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, MapPin, Calendar, CalendarX, TrendingUp, Settings, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Person, PersonRoleStats } from "@/lib/types"
import type { MassRolePreferenceWithDetails, MassRoleBlackoutDate } from "@/lib/actions/mass-role-members-compat"
import { formatDate } from "@/lib/utils/formatters"
import { ModuleViewContainer } from '@/components/module-view-container'

interface MassRoleMembersViewClientProps {
  person: Person
  preferences: MassRolePreferenceWithDetails[]
  blackoutDates: MassRoleBlackoutDate[]
  stats: PersonRoleStats
}

export function MassRoleMembersViewClient({
  person,
  preferences,
  blackoutDates,
  stats
}: MassRoleMembersViewClientProps) {
  const activePreferences = preferences.filter(p => p.active)
  const upcomingBlackouts = blackoutDates.filter(
    bd => new Date(bd.end_date) >= new Date()
  )

  // Action buttons
  const actionButtons = (
    <>
      <Button asChild className="w-full">
        <Link href={`/settings/mass-configuration/ministry-volunteers/${person.id}/preferences`}>
          <Settings className="h-4 w-4 mr-2" />
          Manage Preferences
        </Link>
      </Button>
      <Button variant="outline" asChild className="w-full">
        <Link href={`/people/${person.id}`}>
          View Full Profile
        </Link>
      </Button>
    </>
  )

  // Details section content
  const details = (
    <>
      {person.email && (
        <div>
          <span className="font-medium">Email:</span>{' '}
          <a href={`mailto:${person.email}`} className="hover:underline text-sm">
            {person.email}
          </a>
        </div>
      )}
      {person.phone_number && (
        <div className={person.email ? "pt-2 border-t" : ""}>
          <span className="font-medium">Phone:</span>{' '}
          <a href={`tel:${person.phone_number}`} className="hover:underline text-sm">
            {person.phone_number}
          </a>
        </div>
      )}
    </>
  )

  return (
    <ModuleViewContainer
      entity={person}
      entityType="Mass Role Member"
      modulePath="mass-role-members"
      actionButtons={actionButtons}
      details={details}
    >
      <div className="space-y-6">
        {/* Metadata */}
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Calendar className="h-3 w-3" />
          Added {formatDate(person.created_at)}
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

        {/* Role Memberships */}
        <Card>
          <CardHeader>
            <CardTitle>Mass Role Memberships</CardTitle>
          </CardHeader>
          <CardContent>
            {activePreferences.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Not assigned to any mass roles</p>
                <Button variant="link" asChild className="mt-2">
                  <Link href={`/settings/mass-configuration/ministry-volunteers/${person.id}/preferences`}>
                    Assign roles
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {activePreferences.map((member) => (
                  <div key={member.id} className="border-l-2 border-primary pl-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">
                        {member.mass_role?.name || 'Unknown Role'}
                      </h4>
                      <Badge variant={member.membership_type === 'LEADER' ? 'default' : 'secondary'}>
                        {member.membership_type}
                      </Badge>
                    </div>
                    {member.notes && (
                      <div className="text-sm text-muted-foreground italic">
                        {member.notes}
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
    </ModuleViewContainer>
  )
}
