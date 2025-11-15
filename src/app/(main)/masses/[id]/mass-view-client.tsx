"use client"

import { MassWithRelations } from '@/lib/actions/masses'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MASS_ROLE_STATUS_LABELS } from '@/lib/constants'

interface MassViewClientProps {
  mass: MassWithRelations
}

export function MassViewClient({ mass }: MassViewClientProps) {
  // Group role assignments by role
  const roleAssignmentsByRole = mass.mass_roles?.reduce((acc, assignment) => {
    const roleId = assignment.role_id
    if (!acc[roleId]) {
      acc[roleId] = {
        role: assignment.role,
        assignments: []
      }
    }
    acc[roleId].assignments.push(assignment)
    return acc
  }, {} as Record<string, { role: any; assignments: any[] }>) || {}

  return (
    <div className="space-y-6">
      {/* Basic Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Mass Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mass.event && (
            <div>
              <div className="text-sm font-medium text-muted-foreground">Event</div>
              <div className="text-base">{mass.event.name}</div>
              {mass.event.start_date && (
                <div className="text-sm text-muted-foreground">
                  {new Date(mass.event.start_date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </div>
              )}
              {mass.event.location && (
                <div className="text-sm text-muted-foreground">
                  {mass.event.location.name}
                </div>
              )}
            </div>
          )}

          {mass.presider && (
            <div>
              <div className="text-sm font-medium text-muted-foreground">Presider</div>
              <div className="text-base">
                {mass.presider.first_name} {mass.presider.last_name}
              </div>
            </div>
          )}

          {mass.homilist && (
            <div>
              <div className="text-sm font-medium text-muted-foreground">Homilist</div>
              <div className="text-base">
                {mass.homilist.first_name} {mass.homilist.last_name}
              </div>
            </div>
          )}

          {mass.status && (
            <div>
              <div className="text-sm font-medium text-muted-foreground">Status</div>
              <Badge variant="secondary">{mass.status}</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Assignments Card */}
      {mass.mass_roles && mass.mass_roles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Role Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.values(roleAssignmentsByRole).map(({ role, assignments }) => (
                <div key={role.id} className="space-y-2">
                  <div className="font-medium text-sm text-muted-foreground">
                    {role.name}
                  </div>
                  <div className="space-y-1 ml-4">
                    {assignments.map(assignment => (
                      <div key={assignment.id} className="flex items-center gap-2">
                        <span className="text-base">
                          {assignment.person.first_name} {assignment.person.last_name}
                        </span>
                        {assignment.status && assignment.status !== 'ASSIGNED' && (
                          <Badge variant="outline" className="text-xs">
                            {MASS_ROLE_STATUS_LABELS[assignment.status as keyof typeof MASS_ROLE_STATUS_LABELS]?.en || assignment.status}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Petitions Card */}
      {mass.petitions && (
        <Card>
          <CardHeader>
            <CardTitle>Petitions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap text-base">{mass.petitions}</div>
          </CardContent>
        </Card>
      )}

      {/* Announcements Card */}
      {mass.announcements && (
        <Card>
          <CardHeader>
            <CardTitle>Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap text-base">{mass.announcements}</div>
          </CardContent>
        </Card>
      )}

      {/* Notes Card */}
      {mass.note && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap text-base text-muted-foreground">
              {mass.note}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
