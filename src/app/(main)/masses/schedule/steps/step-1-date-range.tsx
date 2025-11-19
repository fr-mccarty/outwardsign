'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Calendar, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Step1DateRangeProps {
  startDate: string
  endDate: string
  onChange: (field: 'startDate' | 'endDate', value: string) => void
}

export function Step1DateRange({ startDate, endDate, onChange }: Step1DateRangeProps) {
  // Calculate days between dates
  const getDayCount = () => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays
  }

  const dayCount = getDayCount()
  const isValid = startDate && endDate && new Date(endDate) >= new Date(startDate)
  const showWarning = dayCount > 365

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <Calendar className="h-6 w-6 text-primary mt-1" />
        <div>
          <h2 className="text-2xl font-semibold">Select Date Range</h2>
          <p className="text-muted-foreground mt-1">
            Choose the period for which you want to schedule Masses
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scheduling Period</CardTitle>
          <CardDescription>
            Define the start and end dates for your Mass schedule
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="startDate">
                Start Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => onChange('startDate', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">
                End Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => onChange('endDate', e.target.value)}
                min={startDate}
                required
              />
            </div>
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
    </div>
  )
}
