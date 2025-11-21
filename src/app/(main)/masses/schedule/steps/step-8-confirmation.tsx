'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  CheckCircle2,
  Calendar,
  Users,
  CalendarClock,
  BookTemplate,
  AlertTriangle,
  Sparkles
} from "lucide-react"
import { WizardStepHeader } from "@/components/wizard/WizardStepHeader"
import { ProposedMass } from './step-6-proposed-schedule'
import { MassTimesTemplate } from "@/lib/actions/mass-times-templates"
import { MassRoleTemplate } from "@/lib/actions/mass-role-templates"
import { formatDate } from "@/lib/utils/formatters"
import { getDayCount } from "@/lib/utils/date-format"
import { cn } from '@/lib/utils'

interface Step8ConfirmationProps {
  startDate: string
  endDate: string
  proposedMasses: ProposedMass[]
  massTimesTemplates: MassTimesTemplate[]
  selectedMassTimesTemplateIds: string[]
  roleTemplates: MassRoleTemplate[]
  selectedRoleTemplateIds: string[]
}

export function Step8Confirmation({
  startDate,
  endDate,
  proposedMasses,
  massTimesTemplates,
  selectedMassTimesTemplateIds,
  roleTemplates,
  selectedRoleTemplateIds
}: Step8ConfirmationProps) {
  const includedMasses = proposedMasses.filter(m => m.isIncluded)

  // Calculate statistics
  const stats = useMemo(() => {
    const assignments = includedMasses.flatMap(m => m.assignments || [])
    const assignedCount = assignments.filter(a => a.personId).length
    const unassignedCount = assignments.filter(a => !a.personId).length
    const uniqueMinisters = new Set(
      assignments.filter(a => a.personId).map(a => a.personId)
    ).size

    // Count by day of week
    const byDayOfWeek: Record<string, number> = {}
    includedMasses.forEach(m => {
      byDayOfWeek[m.dayOfWeek] = (byDayOfWeek[m.dayOfWeek] || 0) + 1
    })

    return {
      totalMasses: includedMasses.length,
      assignedCount,
      unassignedCount,
      uniqueMinisters,
      byDayOfWeek
    }
  }, [includedMasses])

  const selectedMassTimes = massTimesTemplates.filter(t =>
    selectedMassTimesTemplateIds.includes(t.id)
  )
  const selectedRoles = roleTemplates.filter(t =>
    selectedRoleTemplateIds.includes(t.id)
  )


  const hasUnassigned = stats.unassignedCount > 0

  return (
    <div className="space-y-6">
      <WizardStepHeader
        icon={CheckCircle2}
        title="Confirm & Create"
        description="Review your selections before creating the masses"
      />

      {/* Warning if unassigned */}
      {hasUnassigned && (
        <Alert className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-700 dark:text-amber-300">
            {stats.unassignedCount} role{stats.unassignedCount !== 1 ? 's are' : ' is'} still unassigned.
            You can continue and assign them later, or go back to make assignments now.
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{stats.totalMasses}</div>
              <div className="text-sm text-muted-foreground mt-1">Masses to Create</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{getDayCount(startDate, endDate)}</div>
              <div className="text-sm text-muted-foreground mt-1">Days</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{stats.uniqueMinisters}</div>
              <div className="text-sm text-muted-foreground mt-1">Ministers</div>
            </div>
          </CardContent>
        </Card>
        <Card className={cn(hasUnassigned && "border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20")}>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className={cn("text-3xl font-bold", hasUnassigned && "text-amber-600")}>
                {stats.assignedCount}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Assignments
                {hasUnassigned && <span className="text-amber-600"> ({stats.unassignedCount} empty)</span>}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Summary */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Date Range */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Date Range
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Start:</span>
              <span className="font-medium">{formatDate(startDate)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">End:</span>
              <span className="font-medium">{formatDate(endDate)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Mass Times */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-primary" />
              Mass Times Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {selectedMassTimes.map(t => (
                <Badge key={t.id} variant="secondary" className="text-xs">
                  {t.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Role Templates */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BookTemplate className="h-4 w-4 text-primary" />
              Role Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {selectedRoles.map(t => (
                <Badge key={t.id} variant="secondary" className="text-xs">
                  {t.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ministers */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Assignment Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Ministers assigned:</span>
              <span className="font-medium">{stats.uniqueMinisters}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total assignments:</span>
              <span className="font-medium">{stats.assignedCount}</span>
            </div>
            {hasUnassigned && (
              <div className="flex justify-between text-sm">
                <span className="text-amber-600">Unassigned:</span>
                <span className="font-medium text-amber-600">{stats.unassignedCount}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Mass Distribution by Day */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Distribution by Day
          </CardTitle>
          <CardDescription>
            Number of masses scheduled per day of week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'].map(day => {
              const count = stats.byDayOfWeek[day] || 0
              return (
                <div
                  key={day}
                  className={cn(
                    "text-center p-3 rounded-lg border",
                    count > 0 ? "bg-primary/5 border-primary/20" : "bg-muted/30"
                  )}
                >
                  <div className="text-xs text-muted-foreground mb-1">
                    {day.slice(0, 3)}
                  </div>
                  <div className={cn(
                    "text-lg font-bold",
                    count > 0 ? "text-primary" : "text-muted-foreground"
                  )}>
                    {count}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Final Confirmation */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <CheckCircle2 className="h-12 w-12 text-primary mx-auto" />
            <h3 className="text-xl font-semibold">Ready to Create {stats.totalMasses} Masses</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Click "Schedule Masses" to create all masses and their assignments.
              This action will add {stats.totalMasses} new masses to your parish calendar.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
