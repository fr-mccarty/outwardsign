'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { CalendarClock, Plus, X, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FormField } from "@/components/form-field"

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
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
]

const LANGUAGE_OPTIONS = [
  { value: 'ENGLISH', label: 'English' },
  { value: 'SPANISH', label: 'Spanish' },
  { value: 'BILINGUAL', label: 'Bilingual' },
]

export function Step2SchedulePattern({
  schedule,
  onChange,
  startDate,
  endDate
}: Step2SchedulePatternProps) {
  const addMassTime = () => {
    onChange([
      ...schedule,
      {
        id: crypto.randomUUID(),
        dayOfWeek: 0,
        time: '09:00',
        language: 'ENGLISH',
      },
    ])
  }

  const removeMassTime = (id: string) => {
    onChange(schedule.filter((entry) => entry.id !== id))
  }

  const updateMassTime = (id: string, updates: Partial<MassScheduleEntry>) => {
    onChange(
      schedule.map((entry) =>
        entry.id === id ? { ...entry, ...updates } : entry
      )
    )
  }

  // Calculate how many Masses will be created
  const calculateMassCount = () => {
    if (!startDate || !endDate || schedule.length === 0) return 0

    const start = new Date(startDate)
    const end = new Date(endDate)
    let count = 0

    // For each day in the range
    const currentDate = new Date(start)
    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay()
      // Count how many schedule entries match this day
      const matchingEntries = schedule.filter((entry) => entry.dayOfWeek === dayOfWeek)
      count += matchingEntries.length
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return count
  }

  const totalMasses = calculateMassCount()

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <CalendarClock className="h-6 w-6 text-primary mt-1" />
        <div>
          <h2 className="text-2xl font-semibold">Define Mass Schedule</h2>
          <p className="text-muted-foreground mt-1">
            Set the recurring pattern for your Masses
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Mass Times</CardTitle>
              <CardDescription>
                Add each Mass that repeats during the scheduling period
              </CardDescription>
            </div>
            <Button onClick={addMassTime} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Mass Time
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {schedule.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarClock className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No Mass times added yet</p>
              <Button onClick={addMassTime} variant="outline" className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Mass Time
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {schedule.map((entry, index) => (
                <Card key={entry.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          id={`day-${entry.id}`}
                          label="Day of Week"
                          inputType="select"
                          value={entry.dayOfWeek.toString()}
                          onChange={(value) =>
                            updateMassTime(entry.id, { dayOfWeek: parseInt(value) })
                          }
                          options={DAYS_OF_WEEK.map((day) => ({
                            value: day.value.toString(),
                            label: day.label,
                          }))}
                          required
                        />

                        <div className="space-y-2">
                          <Label htmlFor={`time-${entry.id}`}>
                            Time <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id={`time-${entry.id}`}
                            type="time"
                            value={entry.time}
                            onChange={(e) =>
                              updateMassTime(entry.id, { time: e.target.value })
                            }
                            required
                          />
                        </div>

                        <FormField
                          id={`language-${entry.id}`}
                          label="Language"
                          inputType="select"
                          value={entry.language}
                          onChange={(value) =>
                            updateMassTime(entry.id, {
                              language: value as 'ENGLISH' | 'SPANISH' | 'BILINGUAL'
                            })
                          }
                          options={LANGUAGE_OPTIONS}
                          required
                        />
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMassTime(entry.id)}
                        className="flex-shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {schedule.length > 0 && totalMasses > 0 && (
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
                    const dayEntries = schedule.filter(
                      (entry) => entry.dayOfWeek === day.value
                    )
                    if (dayEntries.length === 0) return null

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
                        <span>{day.label}:</span>
                        <span>
                          {dayEntries.length} Mass{dayEntries.length !== 1 ? 'es' : ''} × {occurrences} weeks = {dayEntries.length * occurrences} Masses
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

      {schedule.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You must add at least one Mass time to continue
          </AlertDescription>
        </Alert>
      )}

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm">
            <h4 className="font-medium">Examples:</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Sunday 8:00 AM (English) + Sunday 10:30 AM (English) + Sunday 12:00 PM (Spanish)</li>
              <li>Saturday 5:00 PM (English) vigil Mass</li>
              <li>Weekday Masses: Monday-Friday 8:00 AM (English)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
