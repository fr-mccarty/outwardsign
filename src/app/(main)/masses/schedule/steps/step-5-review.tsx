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
import { WizardStepHeader } from "@/components/wizard/WizardStepHeader"
import { MassRoleTemplate } from "@/lib/actions/mass-role-templates"
import { MassTimesTemplateWithItems } from "@/lib/actions/mass-times-templates"
import { LITURGICAL_DAYS_OF_WEEK_LABELS, LITURGICAL_DAYS_OF_WEEK_VALUES, type LiturgicalDayOfWeek } from "@/lib/constants"
import { formatDate, formatTime } from "@/lib/utils/formatters"
import { getDayCount } from "@/lib/utils/date-format"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Step5ReviewProps {
  startDate: string
  endDate: string
  massTimesTemplates: MassTimesTemplateWithItems[]
  selectedMassTimesTemplateIds: string[]
  templateIds: string[]
  templates: MassRoleTemplate[]
  algorithmOptions: {
    balanceWorkload: boolean
    respectBlackoutDates: boolean
    allowManualAdjustments: boolean
  }
  onAlgorithmOptionChange: (option: keyof Step5ReviewProps['algorithmOptions'], value: boolean) => void
  onEditStep: (step: number) => void
  totalMassCount: number
}


export function Step5Review({
  startDate,
  endDate,
  massTimesTemplates,
  selectedMassTimesTemplateIds,
  templateIds,
  templates,
  algorithmOptions,
  onAlgorithmOptionChange,
  onEditStep,
  totalMassCount
}: Step5ReviewProps) {
  const selectedTemplates = templates.filter((t) => templateIds.includes(t.id))
  const selectedMassTimes = massTimesTemplates.filter((t) => selectedMassTimesTemplateIds.includes(t.id))


  // Get day label from constants
  const getDayLabel = (day: string) => {
    const labels = LITURGICAL_DAYS_OF_WEEK_LABELS[day as LiturgicalDayOfWeek]
    return labels?.en ?? day
  }

  // Group selected mass times by day of week
  const groupedMassTimes = selectedMassTimes.reduce((acc, template) => {
    const day = template.day_of_week
    if (!acc[day]) {
      acc[day] = []
    }
    acc[day].push(template)
    return acc
  }, {} as Record<string, MassTimesTemplateWithItems[]>)

  return (
    <div className="space-y-6">
      <WizardStepHeader
        icon={ClipboardCheck}
        title="Review & Confirm"
        description="Review your selections and configure the scheduling algorithm"
      />

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
              <Badge variant="secondary">{getDayCount(startDate, endDate)} days</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Pattern Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <button
              type="button"
              className="flex items-center gap-2 hover:opacity-70 transition-opacity"
              onClick={() => onEditStep(2)}
            >
              <CalendarClock className="h-5 w-5 text-primary" />
              <CardTitle>Mass Schedule</CardTitle>
            </button>
            <Button variant="ghost" size="sm" onClick={() => onEditStep(2)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(groupedMassTimes)
              .sort(([a], [b]) =>
                LITURGICAL_DAYS_OF_WEEK_VALUES.indexOf(a as LiturgicalDayOfWeek) -
                LITURGICAL_DAYS_OF_WEEK_VALUES.indexOf(b as LiturgicalDayOfWeek)
              )
              .map(([day, massTimes]) => (
              <div key={day}>
                <div className="mb-2 pb-1 border-b">
                  <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                    {getDayLabel(day)}
                  </h4>
                </div>
                <div className="space-y-2">
                  {massTimes.map((template) => (
                    <div key={template.id} className="rounded-md border bg-muted/30 px-3 py-2">
                      <div className="space-y-1.5">
                        <div className="font-medium text-sm">{template.name}</div>
                        {template.items && template.items.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {template.items.map((item) => (
                              <Badge key={item.id} variant="secondary" className="text-xs">
                                {formatTime(item.time)}
                                {item.day_type === 'DAY_BEFORE' && ' (Vigil)'}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {template.description && (
                          <p className="text-muted-foreground text-xs">
                            {template.description}
                          </p>
                        )}
                      </div>
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
            <button
              type="button"
              className="flex items-center gap-2 hover:opacity-70 transition-opacity"
              onClick={() => onEditStep(3)}
            >
              <BookTemplate className="h-5 w-5 text-primary" />
              <CardTitle>Role Template</CardTitle>
            </button>
            <Button variant="ghost" size="sm" onClick={() => onEditStep(3)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {selectedTemplates.length > 0 ? (
            <div className="space-y-2">
              {selectedTemplates.map((template) => (
                <div key={template.id} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                  <div>
                    <span className="font-medium">{template.name}</span>
                    {template.description && (
                      <p className="text-sm text-muted-foreground">
                        {template.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No templates selected</p>
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
