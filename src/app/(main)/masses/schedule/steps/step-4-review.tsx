'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  ClipboardCheck,
  Calendar,
  CalendarClock,
  BookTemplate,
  Edit,
  CheckCircle,
  Info
} from "lucide-react"
import { MassScheduleEntry } from './step-2-schedule-pattern'
import { MassRoleTemplate } from "@/lib/actions/mass-role-templates"
import { formatDate } from "@/lib/utils/formatters"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Step4ReviewProps {
  startDate: string
  endDate: string
  schedule: MassScheduleEntry[]
  templateId: string | null
  templates: MassRoleTemplate[]
  algorithmOptions: {
    balanceWorkload: boolean
    respectBlackoutDates: boolean
    allowManualAdjustments: boolean
  }
  onAlgorithmOptionChange: (option: keyof Step4ReviewProps['algorithmOptions'], value: boolean) => void
  onEditStep: (step: number) => void
  totalMassCount: number
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const LANGUAGE_LABELS = {
  ENGLISH: 'English',
  SPANISH: 'Spanish',
  BILINGUAL: 'Bilingual',
}

export function Step4Review({
  startDate,
  endDate,
  schedule,
  templateId,
  templates,
  algorithmOptions,
  onAlgorithmOptionChange,
  onEditStep,
  totalMassCount
}: Step4ReviewProps) {
  const selectedTemplate = templates.find((t) => t.id === templateId)

  const getDayCount = () => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  }

  // Group schedule entries by day of week
  const groupedSchedule = schedule.reduce((acc, entry) => {
    if (!acc[entry.dayOfWeek]) {
      acc[entry.dayOfWeek] = []
    }
    acc[entry.dayOfWeek].push(entry)
    return acc
  }, {} as Record<number, MassScheduleEntry[]>)

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <ClipboardCheck className="h-6 w-6 text-primary mt-1" />
        <div>
          <h2 className="text-2xl font-semibold">Review & Confirm</h2>
          <p className="text-muted-foreground mt-1">
            Review your selections and configure the scheduling algorithm
          </p>
        </div>
      </div>

      {/* Date Range Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <CardTitle>Date Range</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onEditStep(1)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Start Date:</span>
              <span className="font-medium">{formatDate(startDate)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">End Date:</span>
              <span className="font-medium">{formatDate(endDate)}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-muted-foreground">Duration:</span>
              <Badge variant="secondary">{getDayCount()} days</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Pattern Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-primary" />
              <CardTitle>Mass Schedule</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onEditStep(2)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(groupedSchedule).map(([dayOfWeek, entries]) => (
              <div key={dayOfWeek} className="space-y-2">
                <h4 className="font-medium text-sm">
                  {DAYS_OF_WEEK[parseInt(dayOfWeek)]}
                </h4>
                <div className="ml-4 space-y-1">
                  {entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-muted-foreground">
                        {entry.time}
                      </span>
                      <Badge variant="outline">
                        {LANGUAGE_LABELS[entry.language]}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Template Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookTemplate className="h-5 w-5 text-primary" />
              <CardTitle>Role Template</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onEditStep(3)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {selectedTemplate ? (
            <div className="space-y-2">
              <div>
                <span className="font-medium">{selectedTemplate.name}</span>
              </div>
              {selectedTemplate.description && (
                <p className="text-sm text-muted-foreground">
                  {selectedTemplate.description}
                </p>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">No template selected</p>
          )}
        </CardContent>
      </Card>

      {/* Total Summary */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Total Masses to Create</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Based on your schedule pattern and date range
              </p>
            </div>
            <div className="text-4xl font-bold text-primary">
              {totalMassCount}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Algorithm Options */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduling Algorithm Options</CardTitle>
          <CardDescription>
            Configure how the automatic assignment algorithm should work
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="balanceWorkload"
              checked={algorithmOptions.balanceWorkload}
              onCheckedChange={(checked) =>
                onAlgorithmOptionChange('balanceWorkload', checked as boolean)
              }
            />
            <div className="space-y-1">
              <Label htmlFor="balanceWorkload" className="font-medium cursor-pointer">
                Balance Workload
              </Label>
              <p className="text-sm text-muted-foreground">
                Distribute assignments evenly across all eligible ministers
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="respectBlackoutDates"
              checked={algorithmOptions.respectBlackoutDates}
              onCheckedChange={(checked) =>
                onAlgorithmOptionChange('respectBlackoutDates', checked as boolean)
              }
            />
            <div className="space-y-1">
              <Label htmlFor="respectBlackoutDates" className="font-medium cursor-pointer">
                Respect Blackout Dates
              </Label>
              <p className="text-sm text-muted-foreground">
                Never assign ministers during their unavailable periods (vacations, travel, etc.)
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="allowManualAdjustments"
              checked={algorithmOptions.allowManualAdjustments}
              onCheckedChange={(checked) =>
                onAlgorithmOptionChange('allowManualAdjustments', checked as boolean)
              }
            />
            <div className="space-y-1">
              <Label htmlFor="allowManualAdjustments" className="font-medium cursor-pointer">
                Allow Manual Adjustments
              </Label>
              <p className="text-sm text-muted-foreground">
                Show assignment editor to manually adjust assignments before finalizing
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Click "Complete" to begin scheduling. The system will create {totalMassCount} Mass records
          and automatically assign ministers based on your configured options. This may take a few moments.
        </AlertDescription>
      </Alert>
    </div>
  )
}
