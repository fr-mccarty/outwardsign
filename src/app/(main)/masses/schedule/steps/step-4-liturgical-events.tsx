'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Calendar, AlertCircle, Loader2 } from "lucide-react"
import { WizardStepHeader } from "@/components/wizard/WizardStepHeader"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { getGlobalLiturgicalEvents, type GlobalLiturgicalEvent } from "@/lib/actions/global-liturgical-events"
import { formatDatePretty, formatDateLong } from "@/lib/utils/formatters"
import { getLiturgicalGradeLabel, DEFAULT_TIMEZONE } from "@/lib/constants"
import { MassTimesTemplateWithItems } from "@/lib/actions/mass-times-templates"
import { getDayOfWeekNumber } from '@/lib/utils/formatters'

interface Step4LiturgicalEventsProps {
  startDate: string
  endDate: string
  selectedEventIds: string[]
  onSelectionChange: (eventIds: string[]) => void
  massTimesTemplates?: MassTimesTemplateWithItems[]
  selectedMassTimesTemplateIds?: string[]
}

// Color mapping for liturgical colors
const COLOR_CLASSES: Record<string, string> = {
  green: 'bg-green-500',
  white: 'bg-white border border-gray-300',
  red: 'bg-red-500',
  violet: 'bg-violet-500',
  purple: 'bg-violet-500',
  rose: 'bg-pink-400',
  black: 'bg-black',
  gold: 'bg-yellow-500',
}

export function Step4LiturgicalEvents({
  startDate,
  endDate,
  selectedEventIds,
  onSelectionChange,
  massTimesTemplates = [],
  selectedMassTimesTemplateIds = []
}: Step4LiturgicalEventsProps) {
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<GlobalLiturgicalEvent[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchEvents() {
      if (!startDate || !endDate) return

      setLoading(true)
      setError(null)

      try {
        const data = await getGlobalLiturgicalEvents(startDate, endDate)
        setEvents(data)

        // Auto-select Sundays and Solemnities by default if nothing selected
        if (selectedEventIds.length === 0) {
          const defaultSelectedIds = data
            .filter(event => {
              const date = new Date(event.date)
              const isSunday = date.getDay() === 0
              const isSolemnity = event.event_data.grade_lcl?.toLowerCase() === 'solemnity' ||
                event.event_data.grade_lcl?.toLowerCase() === 'celebration with precedence over solemnities'
              return isSunday || isSolemnity
            })
            .map(event => event.id)
          onSelectionChange(defaultSelectedIds)
        }
      } catch (err) {
        console.error('Failed to fetch liturgical events:', err)
        setError('Failed to load liturgical events')
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]) // onSelectionChange is stable, selectedEventIds.length intentionally omitted to only run on date range change

  const handleEventToggle = (eventId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedEventIds, eventId])
    } else {
      onSelectionChange(selectedEventIds.filter(id => id !== eventId))
    }
  }

  // Group events by date
  const groupEventsByDate = (eventList: GlobalLiturgicalEvent[]) => {
    return eventList.reduce((acc, event) => {
      const date = event.date
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(event)
      return acc
    }, {} as Record<string, GlobalLiturgicalEvent[]>)
  }

  const eventsByDate = groupEventsByDate(events)

  // Identify dates with multiple events
  const datesWithMultipleEvents = Object.entries(eventsByDate)
    .filter(([, events]) => events.length > 1)
    .map(([date]) => date)

  // Check if a date has any Mass times scheduled
  const dateHasMassTime = (dateStr: string): boolean => {
    const date = new Date(dateStr + `T00:00:00${DEFAULT_TIMEZONE === 'UTC' ? 'Z' : ''}`)
    const dayOfWeek = date.getUTCDay()

    // Never show "No Mass Time" badge for Saturday (6) or Sunday (0)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return true
    }

    return selectedMassTimesTemplateIds.some(templateId => {
      const template = massTimesTemplates.find(t => t.id === templateId)
      if (!template) return false

      const templateDayNumber = getDayOfWeekNumber(template.day_of_week)
      return templateDayNumber === dayOfWeek
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Loading liturgical events...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <WizardStepHeader
        icon={Calendar}
        title="Select Liturgical Events"
        description="Choose which liturgical celebrations to use for each Mass"
      />

      {datesWithMultipleEvents.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {datesWithMultipleEvents.length} date{datesWithMultipleEvents.length !== 1 ? 's have' : ' has'} multiple liturgical events.
            Select which celebration to use for Masses on those days.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Liturgical Calendar</CardTitle>
          <CardDescription>
            {formatDatePretty(startDate)} – {formatDatePretty(endDate)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(eventsByDate).map(([date, dayEvents]) => {
            const hasMassTime = dateHasMassTime(date)
            return (
            <div key={date} className="space-y-2">
              <h3 className="font-medium text-sm border-b pb-1">
                {formatDateLong(date)}
                {dayEvents.length > 1 && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    {dayEvents.length} options
                  </Badge>
                )}
                {!hasMassTime && (
                  <Badge variant="outline" className="ml-2 text-xs bg-yellow-100 text-yellow-800 border-yellow-300">
                    No Mass Time
                  </Badge>
                )}
              </h3>
              <div className="space-y-2 pl-2">
                {dayEvents.map((event) => {
                  const isSelected = selectedEventIds.includes(event.id)
                  return (
                  <div
                    key={event.id}
                    className="flex items-start space-x-3 p-3 rounded-lg border bg-card hover:bg-accent transition-colors cursor-pointer"
                    onClick={() => handleEventToggle(event.id, !isSelected)}
                  >
                    <Checkbox
                      id={`event-${event.id}`}
                      checked={isSelected}
                      onCheckedChange={(checked) =>
                        handleEventToggle(event.id, checked === true)
                      }
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Label
                          htmlFor={`event-${event.id}`}
                          className="font-medium cursor-pointer"
                        >
                          {event.event_data.name}
                        </Label>
                        {event.event_data.color?.map((color, idx) => (
                          <span
                            key={idx}
                            className={`w-3 h-3 rounded-full ${COLOR_CLASSES[color.toLowerCase()] || 'bg-gray-400'}`}
                            title={color}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {getLiturgicalGradeLabel(event.event_data.grade_lcl)}
                        {event.event_data.liturgical_season_lcl && (
                          <> • {event.event_data.liturgical_season_lcl}</>
                        )}
                      </p>
                    </div>
                  </div>
                  )
                })}
              </div>
            </div>
            )
          })}
        </CardContent>
      </Card>

      <Card className={selectedEventIds.length === 0 ? "border-destructive" : "bg-primary/5 border-primary/20"}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {selectedEventIds.length === 0 && (
                <AlertCircle className="h-4 w-4 text-destructive" />
              )}
              <span className="font-medium">Selected Events:</span>
            </div>
            <span className={`text-2xl font-bold ${selectedEventIds.length === 0 ? 'text-destructive' : 'text-primary'}`}>{selectedEventIds.length}</span>
          </div>
        </CardContent>
      </Card>

      {selectedEventIds.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You must select at least one liturgical event to continue
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
