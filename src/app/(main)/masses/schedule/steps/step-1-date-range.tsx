'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DatePickerField } from "@/components/date-picker-field"
import { toLocalDateString } from "@/lib/utils/formatters"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Calendar, AlertCircle, Zap, Users, ExternalLink } from "lucide-react"
import { toast } from 'sonner'
import { WizardStepHeader } from "@/components/wizard/WizardStepHeader"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { MassRoleWithCount } from '@/lib/actions/mass-roles'
import Link from 'next/link'
import { getDayCount } from '@/lib/utils/formatters'
import { RoleAvailabilityModal } from './role-availability-modal'

// Date shortcut helpers - using toLocalDateString to avoid timezone bugs
function getNextMonthRange(): { start: string; end: string } {
  const today = new Date()
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)
  const lastDayOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0)
  return {
    start: toLocalDateString(nextMonth),
    end: toLocalDateString(lastDayOfNextMonth),
  }
}

function getRestOfThisMonthRange(): { start: string; end: string } {
  const today = new Date()
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  return {
    start: toLocalDateString(today),
    end: toLocalDateString(lastDayOfMonth),
  }
}

function getNextWeeksRange(weeks: number): { start: string; end: string } {
  const today = new Date()
  const endDate = new Date(today)
  endDate.setDate(today.getDate() + (weeks * 7) - 1)
  return {
    start: toLocalDateString(today),
    end: toLocalDateString(endDate),
  }
}

function getNextQuarterRange(): { start: string; end: string } {
  const today = new Date()
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)
  const threeMonthsLater = new Date(today.getFullYear(), today.getMonth() + 4, 0)
  return {
    start: toLocalDateString(nextMonth),
    end: toLocalDateString(threeMonthsLater),
  }
}

function getCalendarQuarterRange(quarter: 1 | 2 | 3 | 4, year?: number): { start: string; end: string } {
  const targetYear = year ?? new Date().getFullYear()
  const startMonth = (quarter - 1) * 3
  const start = new Date(targetYear, startMonth, 1)
  const end = new Date(targetYear, startMonth + 3, 0)
  return {
    start: toLocalDateString(start),
    end: toLocalDateString(end),
  }
}

interface Step1DateRangeProps {
  startDate: string
  endDate: string
  onChange: (field: 'startDate' | 'endDate', value: string) => void
  massRolesWithCounts: MassRoleWithCount[]
}

export function Step1DateRange({ startDate, endDate, onChange, massRolesWithCounts }: Step1DateRangeProps) {
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<MassRoleWithCount | null>(null)
  const [roleModalOpen, setRoleModalOpen] = useState(false)

  const applyShortcut = (range: { start: string; end: string }) => {
    onChange('startDate', range.start)
    onChange('endDate', range.end)
    setShortcutsOpen(false)
  }

  const handleRoleClick = (role: MassRoleWithCount, e: React.MouseEvent) => {
    e.preventDefault()
    if (!startDate || !endDate || new Date(endDate) < new Date(startDate)) {
      toast.info('Please select a valid date range first to see minister availability for that period')
      return
    }
    setSelectedRole(role)
    setRoleModalOpen(true)
  }

  const dayCount = getDayCount(startDate, endDate)
  const isValid = startDate && endDate && new Date(endDate) >= new Date(startDate)
  const showWarning = dayCount > 365

  return (
    <div className="space-y-6">
      <WizardStepHeader
        icon={Calendar}
        title="Select Date Range"
        description="Choose the period for which you want to schedule Masses"
      />

      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>Scheduling Period</CardTitle>
            <CardDescription>
              Define the start and end dates for your Mass schedule
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShortcutsOpen(true)}
          >
            <Zap className="h-4 w-4 mr-1" />
            Quick Fill
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DatePickerField
              id="startDate"
              label="Start Date"
              value={startDate ? new Date(startDate + 'T12:00:00') : undefined}
              onValueChange={(date) => onChange('startDate', date ? toLocalDateString(date) : '')}
              required
              closeOnSelect
            />

            <DatePickerField
              id="endDate"
              label="End Date"
              value={endDate ? new Date(endDate + 'T12:00:00') : undefined}
              onValueChange={(date) => onChange('endDate', date ? toLocalDateString(date) : '')}
              disabled={(date) => startDate ? date < new Date(startDate + 'T00:00:00') : false}
              required
              closeOnSelect
            />
          </div>

          {isValid && (
            <div className="p-4 rounded-lg bg-muted">
              <div className="flex items-center justify-between">
                <span className="font-medium">Selected Period:</span>
                <span className="text-lg font-bold">{dayCount} days</span>
              </div>
            </div>
          )}

          {!isValid && startDate && endDate && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                End date must be on or after start date
              </AlertDescription>
            </Alert>
          )}

          {showWarning && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You have selected a period longer than one year ({dayCount} days).
                This may create a large number of Masses and take longer to process.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Mass Roles Overview */}
      {massRolesWithCounts.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Available Ministers by Role</CardTitle>
            </div>
            <CardDescription>
              Click a role to see available ministers for the selected dates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {massRolesWithCounts.map(role => (
                <button
                  key={role.id}
                  onClick={(e) => handleRoleClick(role, e)}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent transition-colors text-left"
                >
                  <span className="text-sm font-medium truncate">{role.name}</span>
                  <Badge variant={role.member_count > 0 ? "secondary" : "outline"}>
                    {role.member_count}
                  </Badge>
                </button>
              ))}
            </div>
            {massRolesWithCounts.every(r => r.member_count === 0) && (
              <Alert className="mt-3">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>No ministers have been assigned to roles yet.</span>
                  <Link
                    href="/settings/mass-roles"
                    className="inline-flex items-center gap-1 text-primary hover:underline ml-2"
                  >
                    Manage Roles <ExternalLink className="h-3 w-3" />
                  </Link>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm">
            <h4 className="font-medium">Tips:</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Typical scheduling periods are 4-12 weeks</li>
              <li>You can schedule as far in advance as needed</li>
              <li>Masses will be created based on the pattern you define in the next step</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Quick Fill Dialog */}
      <Dialog open={shortcutsOpen} onOpenChange={setShortcutsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Quick Fill Date Range</DialogTitle>
            <DialogDescription>
              Select a preset date range to quickly fill the start and end dates.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-4">
            <Button
              variant="outline"
              className="justify-start h-auto py-3"
              onClick={() => applyShortcut(getRestOfThisMonthRange())}
            >
              <div className="text-left">
                <div className="font-medium">Rest of This Month</div>
                <div className="text-xs text-muted-foreground">From today until end of month</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start h-auto py-3"
              onClick={() => applyShortcut(getNextMonthRange())}
            >
              <div className="text-left">
                <div className="font-medium">Next Month</div>
                <div className="text-xs text-muted-foreground">Full calendar month</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start h-auto py-3"
              onClick={() => applyShortcut(getNextWeeksRange(4))}
            >
              <div className="text-left">
                <div className="font-medium">Next 4 Weeks</div>
                <div className="text-xs text-muted-foreground">28 days starting today</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start h-auto py-3"
              onClick={() => applyShortcut(getNextWeeksRange(8))}
            >
              <div className="text-left">
                <div className="font-medium">Next 8 Weeks</div>
                <div className="text-xs text-muted-foreground">56 days starting today</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start h-auto py-3"
              onClick={() => applyShortcut(getNextQuarterRange())}
            >
              <div className="text-left">
                <div className="font-medium">Next Quarter</div>
                <div className="text-xs text-muted-foreground">Next 3 calendar months</div>
              </div>
            </Button>

            <div className="border-t my-2" />
            <div className="text-xs text-muted-foreground font-medium px-1">Calendar Quarters ({new Date().getFullYear()})</div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="justify-start h-auto py-2"
                onClick={() => applyShortcut(getCalendarQuarterRange(1))}
              >
                <div className="text-left">
                  <div className="font-medium text-sm">Q1</div>
                  <div className="text-xs text-muted-foreground">Jan - Mar</div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="justify-start h-auto py-2"
                onClick={() => applyShortcut(getCalendarQuarterRange(2))}
              >
                <div className="text-left">
                  <div className="font-medium text-sm">Q2</div>
                  <div className="text-xs text-muted-foreground">Apr - Jun</div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="justify-start h-auto py-2"
                onClick={() => applyShortcut(getCalendarQuarterRange(3))}
              >
                <div className="text-left">
                  <div className="font-medium text-sm">Q3</div>
                  <div className="text-xs text-muted-foreground">Jul - Sep</div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="justify-start h-auto py-2"
                onClick={() => applyShortcut(getCalendarQuarterRange(4))}
              >
                <div className="text-left">
                  <div className="font-medium text-sm">Q4</div>
                  <div className="text-xs text-muted-foreground">Oct - Dec</div>
                </div>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Role Availability Modal */}
      <RoleAvailabilityModal
        role={selectedRole}
        open={roleModalOpen}
        onOpenChange={setRoleModalOpen}
        startDate={startDate}
        endDate={endDate}
      />
    </div>
  )
}
