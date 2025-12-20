'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/content-card"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle2,
  Users,
  CalendarDays,
  Sparkles
} from "lucide-react"
import { WizardStepHeader } from "@/components/wizard/WizardStepHeader"
import type { ScheduleMassesResult } from '@/lib/actions/mass-scheduling'
import { formatDate } from "@/lib/utils/formatters"

interface Step7ConfirmationProps {
  result: ScheduleMassesResult
}

export function Step7Confirmation({ result }: Step7ConfirmationProps) {
  // Calculate statistics
  const assignmentRate = result.totalRoles > 0
    ? Math.round((result.rolesAssigned / result.totalRoles) * 100)
    : 0

  // Group masses by date
  const massesByDate = result.masses.reduce((acc, mass) => {
    if (!acc[mass.date]) {
      acc[mass.date] = []
    }
    acc[mass.date].push(mass)
    return acc
  }, {} as Record<string, typeof result.masses>)

  const uniqueDates = Object.keys(massesByDate).sort()
  const uniqueMinistersSet = new Set<string>()
  result.masses.forEach(mass => {
    mass.assignments.forEach(a => {
      if (a.personId) {
        uniqueMinistersSet.add(a.personId)
      }
    })
  })

  return (
    <div className="space-y-6">
      <WizardStepHeader
        icon={CheckCircle2}
        title="Masses Created Successfully!"
        description="Your masses have been created and are now visible in the parish calendar"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{result.massesCreated}</div>
              <div className="text-sm text-muted-foreground mt-1">Masses Created</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{uniqueDates.length}</div>
              <div className="text-sm text-muted-foreground mt-1">Unique Dates</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{result.rolesAssigned}</div>
              <div className="text-sm text-muted-foreground mt-1">Roles Assigned</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{uniqueMinistersSet.size}</div>
              <div className="text-sm text-muted-foreground mt-1">Ministers Involved</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assignment Summary */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Assignment Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Roles:</span>
              <span className="font-medium">{result.totalRoles}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Assigned:</span>
              <span className="font-medium text-green-600">{result.rolesAssigned}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Unassigned:</span>
              <span className="font-medium text-amber-600">{result.rolesUnassigned}</span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Assignment Rate:</span>
                <Badge variant={assignmentRate >= 80 ? "default" : assignmentRate >= 50 ? "secondary" : "destructive"}>
                  {assignmentRate}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              Date Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[180px] overflow-y-auto">
              {uniqueDates.slice(0, 5).map(date => (
                <div key={date} className="flex justify-between text-sm items-center">
                  <span className="text-muted-foreground">{formatDate(date)}</span>
                  <Badge variant="outline">{massesByDate[date].length} mass{massesByDate[date].length > 1 ? 'es' : ''}</Badge>
                </div>
              ))}
              {uniqueDates.length > 5 && (
                <div className="text-xs text-muted-foreground text-center pt-1">
                  + {uniqueDates.length - 5} more dates
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Records Created Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Records Created
          </CardTitle>
          <CardDescription>
            Summary of all database records created during this operation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="text-2xl font-bold text-primary">{result.massesCreated}</div>
              <div className="text-xs text-muted-foreground mt-1">Master Events</div>
              <div className="text-xs text-muted-foreground">(master_events table)</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="text-2xl font-bold text-primary">{result.massesCreated}</div>
              <div className="text-xs text-muted-foreground mt-1">Calendar Events</div>
              <div className="text-xs text-muted-foreground">(calendar_events table)</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="text-2xl font-bold text-primary">{result.totalRoles}</div>
              <div className="text-xs text-muted-foreground mt-1">Role Assignments</div>
              <div className="text-xs text-muted-foreground">(master_event_roles table)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm">
            <h4 className="font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              What happens next?
            </h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-6">
              <li>All masses are now visible in your parish calendar</li>
              <li>Ministers can view their assigned masses in their schedule</li>
              {result.rolesUnassigned > 0 && (
                <li className="text-amber-600 font-medium">
                  {result.rolesUnassigned} role{result.rolesUnassigned > 1 ? 's' : ''} still need{result.rolesUnassigned === 1 ? 's' : ''} to be assigned manually
                </li>
              )}
              <li>You can edit individual masses from the Masses list</li>
              <li>Ministers will be notified of their assignments (if notifications are enabled)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
