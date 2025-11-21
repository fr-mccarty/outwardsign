'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  CheckCircle2,
  AlertCircle,
  Calendar,
  Users,
  ArrowRight,
  Filter
} from "lucide-react"
import { WizardStepHeader } from "@/components/wizard/WizardStepHeader"
import { useRouter } from 'next/navigation'
import { MassScheduleAssignmentGrid } from '@/components/mass-schedule-assignment-grid'
import type { ScheduleMassesResult } from '@/lib/actions/mass-scheduling'

interface Step9ResultsProps {
  result: ScheduleMassesResult
  startDate: string
}

export function Step8Results({ result, startDate }: Step9ResultsProps) {
  const router = useRouter()
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const assignmentRate = result.totalRoles > 0
    ? Math.round((result.rolesAssigned / result.totalRoles) * 100)
    : 0

  const handleSaveChanges = async () => {
    setIsSaving(true)
    try {
      // Changes are saved immediately via the grid component
      // This button is here for UX clarity
      setHasUnsavedChanges(false)
      // Small delay for feedback
      await new Promise(resolve => setTimeout(resolve, 500))
    } finally {
      setIsSaving(false)
    }
  }

  const handleGoToMasses = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to leave?'
      )
      if (!confirmed) return
    }
    router.push(`/masses?start_date=${startDate}`)
  }

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <WizardStepHeader
        icon={CheckCircle2}
        title="Masses Created Successfully!"
        description="Review role assignments and make manual adjustments as needed"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Masses Created
              </div>
              <div className="text-3xl font-bold text-green-600">
                {result.massesCreated}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                Total Roles
              </div>
              <div className="text-3xl font-bold">
                {result.totalRoles}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">
                Assigned
              </div>
              <div className="text-3xl font-bold text-green-600">
                {result.rolesAssigned}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">
                Unassigned
              </div>
              <div className="text-3xl font-bold text-orange-600">
                {result.rolesUnassigned}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assignment Rate Alert */}
      {assignmentRate < 50 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Low assignment rate ({assignmentRate}%). Most roles need manual assignment.
            {result.rolesUnassigned > 0 && (
              <> Use the grid below to assign ministers to unassigned roles.</>
            )}
          </AlertDescription>
        </Alert>
      )}

      {assignmentRate >= 50 && assignmentRate < 80 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Moderate assignment rate ({assignmentRate}%). Some roles still need manual assignment.
          </AlertDescription>
        </Alert>
      )}

      {assignmentRate >= 80 && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-900 dark:text-green-100">
            Good assignment rate ({assignmentRate}%)! Most roles have been assigned automatically.
          </AlertDescription>
        </Alert>
      )}

      {/* Assignment Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Role Assignments</CardTitle>
              <CardDescription>
                Click any cell to assign or change a minister for that role
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Show Unassigned Only
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <MassScheduleAssignmentGrid
            masses={result.masses}
            onAssignmentChange={() => setHasUnsavedChanges(true)}
          />
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {hasUnsavedChanges && (
            <span className="text-orange-600 font-medium">
              • You have unsaved changes
            </span>
          )}
        </div>
        <div className="flex gap-3">
          {hasUnsavedChanges && (
            <Button
              onClick={handleSaveChanges}
              disabled={isSaving}
              variant="default"
            >
              {isSaving ? 'Saving...' : 'Save All Changes'}
            </Button>
          )}
          <Button
            onClick={handleGoToMasses}
            variant={hasUnsavedChanges ? 'outline' : 'default'}
          >
            Go to Masses List
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Help Text */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm">
            <h4 className="font-medium">Tips:</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Green cells indicate assigned roles</li>
              <li>Red cells indicate unassigned roles that need attention</li>
              <li>Yellow cells show warnings (e.g., minister assigned outside preferences)</li>
              <li>Click any cell to open the people picker and assign a minister</li>
              <li>Changes are saved automatically when you assign someone</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
