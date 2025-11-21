'use client'

import { useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { CalendarClock, AlertCircle, CheckSquare } from "lucide-react"
import { WizardStepHeader } from "@/components/wizard/WizardStepHeader"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { MassTimesTemplateWithItems } from "@/lib/actions/mass-times-templates"
import { LITURGICAL_DAYS_OF_WEEK_LABELS, LITURGICAL_DAYS_OF_WEEK_VALUES, type LiturgicalDayOfWeek } from "@/lib/constants"
import { getDayOfWeekNumber } from '@/lib/utils/date-format'
import { formatTime } from '@/lib/utils/formatters'
import { Badge } from "@/components/ui/badge"

// TODO: Add ability to create a new template on the fly in this step

export interface MassScheduleEntry {
  id: string
  dayOfWeek: number // 0=Sunday, 6=Saturday
  time: string // HH:mm format
  language: 'ENGLISH' | 'SPANISH' | 'BILINGUAL'
}

interface Step2SchedulePatternProps {
  schedule: MassScheduleEntry[]
  onChange: (schedule: MassScheduleEntry[]) => void
  startDate: string
  endDate: string
  massTimesTemplates: MassTimesTemplateWithItems[]
  selectedTemplateIds: string[]
  onTemplateSelectionChange: (templateIds: string[]) => void
}

const DAYS_OF_WEEK = [
  { value: 0, key: 'SUNDAY' },
  { value: 1, key: 'MONDAY' },
  { value: 2, key: 'TUESDAY' },
  { value: 3, key: 'WEDNESDAY' },
  { value: 4, key: 'THURSDAY' },
  { value: 5, key: 'FRIDAY' },
  { value: 6, key: 'SATURDAY' },
]


export function Step2SchedulePattern({
  schedule,
  onChange,
  startDate,
  endDate,
  massTimesTemplates,
  selectedTemplateIds,
  onTemplateSelectionChange
}: Step2SchedulePatternProps) {
  // Track if auto-selection has already happened (use template IDs as key)
  const prevTemplateIdsRef = useRef<string>('')

  // Auto-select all templates when templates first load or change
  useEffect(() => {
    // Create a stable key from template IDs to detect when templates change
    const templateIdsKey = massTimesTemplates.map(t => t.id).sort().join(',')

    // Auto-select if:
    // 1. We have templates
    // 2. No templates are currently selected
    // 3. This is a new set of templates (or first load)
    if (
      massTimesTemplates.length > 0 &&
      selectedTemplateIds.length === 0 &&
      prevTemplateIdsRef.current !== templateIdsKey
    ) {
      const allTemplateIds = massTimesTemplates.map(t => t.id)
      onTemplateSelectionChange(allTemplateIds)
      prevTemplateIdsRef.current = templateIdsKey
    } else if (templateIdsKey) {
      // Update ref even if we didn't auto-select
      prevTemplateIdsRef.current = templateIdsKey
    }
  }, [massTimesTemplates, selectedTemplateIds, onTemplateSelectionChange])

  const handleTemplateToggle = (templateId: string, checked: boolean) => {
    if (checked) {
      onTemplateSelectionChange([...selectedTemplateIds, templateId])
    } else {
      onTemplateSelectionChange(selectedTemplateIds.filter(id => id !== templateId))
    }
  }

  const handleSelectAll = () => {
    const allTemplateIds = massTimesTemplates.map(t => t.id)
    onTemplateSelectionChange(allTemplateIds)
  }

  const allSelected = massTimesTemplates.length > 0 && selectedTemplateIds.length === massTimesTemplates.length

  // Group templates by day_of_week
  const templatesByDay = massTimesTemplates.reduce((acc, template) => {
    const day = template.day_of_week
    if (!acc[day]) {
      acc[day] = []
    }
    acc[day].push(template)
    return acc
  }, {} as Record<string, MassTimesTemplateWithItems[]>)

  // Calculate how many Masses will be created based on selected templates
  const calculateMassCount = () => {
    if (!startDate || !endDate || selectedTemplateIds.length === 0) return 0

    const start = new Date(startDate)
    const end = new Date(endDate)
    let count = 0

    // For each selected template
    selectedTemplateIds.forEach(templateId => {
      const template = massTimesTemplates.find(t => t.id === templateId)
      if (!template) return

      const dayNumber = getDayOfWeekNumber(template.day_of_week)
      if (dayNumber === null) return // Skip MOVABLE for now

      // Count occurrences of this day in date range
      const currentDate = new Date(start)
      while (currentDate <= end) {
        if (currentDate.getDay() === dayNumber) {
          count++
        }
        currentDate.setDate(currentDate.getDate() + 1)
      }
    })

    return count
  }

  const totalMasses = calculateMassCount()

  // Get day label
  const getDayLabel = (day: string) => {
    const labels = LITURGICAL_DAYS_OF_WEEK_LABELS[day as LiturgicalDayOfWeek]
    return labels?.en ?? day
  }

  return (
    <div className="space-y-6">
      <WizardStepHeader
        icon={CalendarClock}
        title="Select Mass Times"
        description="Choose which Mass times to schedule for this period"
      />

      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>Mass Times Templates</CardTitle>
            <CardDescription>
              Select the Mass times you want to include in this schedule
            </CardDescription>
          </div>
          {massTimesTemplates.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              disabled={allSelected}
            >
              <CheckSquare className="h-4 w-4 mr-1" />
              Select All
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {massTimesTemplates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarClock className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No Mass times templates available</p>
              <p className="text-sm mt-2">
                Create templates in Mass Times settings first
              </p>
            </div>
          ) : (
            <>
              {/* Group by day of week, sorted by LITURGICAL_DAYS_OF_WEEK_VALUES order */}
              {Object.entries(templatesByDay)
                .sort(([a], [b]) =>
                  LITURGICAL_DAYS_OF_WEEK_VALUES.indexOf(a as LiturgicalDayOfWeek) -
                  LITURGICAL_DAYS_OF_WEEK_VALUES.indexOf(b as LiturgicalDayOfWeek)
                )
                .map(([day, templates]) => (
                <div key={day} className="space-y-3">
                  <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                    {getDayLabel(day)}
                  </h3>
                  <div className="space-y-2">
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        className="flex items-start space-x-3 p-3 rounded-lg border bg-card hover:bg-accent transition-colors cursor-pointer"
                        onClick={() => {
                          const isCurrentlySelected = selectedTemplateIds.includes(template.id)
                          handleTemplateToggle(template.id, !isCurrentlySelected)
                        }}
                      >
                        <Checkbox
                          id={`template-${template.id}`}
                          checked={selectedTemplateIds.includes(template.id)}
                          onCheckedChange={(checked) =>
                            handleTemplateToggle(template.id, checked === true)
                          }
                        />
                        <div className="flex-1">
                          <Label
                            htmlFor={`template-${template.id}`}
                            className="font-medium cursor-pointer"
                          >
                            {template.name}
                          </Label>
                          {template.items && template.items.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {template.items.map((item) => (
                                <Badge key={item.id} variant="outline" className="text-xs">
                                  {formatTime(item.time)}
                                  {item.day_type === 'DAY_BEFORE' && ' (Vigil)'}
                                </Badge>
                              ))}
                            </div>
                          )}
                          {template.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {template.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </CardContent>
      </Card>

      {selectedTemplateIds.length > 0 && totalMasses > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Total Masses to be Created:</span>
                <span className="text-2xl font-bold text-primary">{totalMasses}</span>
              </div>

              <div className="pt-3 border-t">
                <div className="text-sm space-y-1">
                  {DAYS_OF_WEEK.map((day) => {
                    const selectedForDay = selectedTemplateIds.filter(id => {
                      const template = massTimesTemplates.find(t => t.id === id)
                      return template?.day_of_week === day.key
                    })
                    if (selectedForDay.length === 0) return null

                    // Count occurrences of this day in date range
                    const start = new Date(startDate)
                    const end = new Date(endDate)
                    let occurrences = 0
                    const currentDate = new Date(start)
                    while (currentDate <= end) {
                      if (currentDate.getDay() === day.value) {
                        occurrences++
                      }
                      currentDate.setDate(currentDate.getDate() + 1)
                    }

                    return (
                      <div key={day.value} className="flex items-center justify-between text-muted-foreground">
                        <span>{getDayLabel(day.key)}:</span>
                        <span>
                          {selectedForDay.length} template{selectedForDay.length !== 1 ? 's' : ''} × {occurrences} weeks = {selectedForDay.length * occurrences} Masses
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedTemplateIds.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You must select at least one Mass time template to continue
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
