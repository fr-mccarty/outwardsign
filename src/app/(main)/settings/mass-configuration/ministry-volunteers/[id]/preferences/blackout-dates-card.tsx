'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DatePickerField } from "@/components/date-picker-field"
import { toLocalDateString } from "@/lib/utils/formatters"
import { Badge } from "@/components/ui/badge"
import { Plus, Save, X, CalendarX } from "lucide-react"
import type { MassRoleBlackoutDate } from "@/lib/actions/mass-role-members-compat"
import { createBlackoutDate, deleteBlackoutDate } from "@/lib/actions/mass-role-members-compat"
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { formatDate } from "@/lib/utils/formatters"

interface BlackoutDatesCardProps {
  personId: string
  blackoutDates: MassRoleBlackoutDate[]
}

export function BlackoutDatesCard({
  personId,
  blackoutDates
}: BlackoutDatesCardProps) {
  const router = useRouter()
  const [isAdding, setIsAdding] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [reason, setReason] = useState('')

  const handleAdd = () => {
    setIsAdding(true)
    setStartDate(undefined)
    setEndDate(undefined)
    setReason('')
  }

  const handleCancel = () => {
    setIsAdding(false)
  }

  const handleSave = async () => {
    if (!startDate || !endDate) {
      toast.error('Please select start and end dates')
      return
    }

    if (endDate < startDate) {
      toast.error('End date must be after start date')
      return
    }

    setIsSaving(true)
    try {
      await createBlackoutDate({
        person_id: personId,
        start_date: toLocalDateString(startDate),
        end_date: toLocalDateString(endDate),
        reason: reason || undefined
      })
      toast.success('Blackout date added successfully')
      setIsAdding(false)
      router.refresh()
    } catch (error) {
      console.error('Error creating blackout date:', error)
      toast.error('Failed to add blackout date')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (blackoutId: string) => {
    if (!confirm('Are you sure you want to delete this blackout date?')) {
      return
    }

    setIsSaving(true)
    try {
      await deleteBlackoutDate(blackoutId)
      toast.success('Blackout date deleted successfully')
      router.refresh()
    } catch (error) {
      console.error('Error deleting blackout date:', error)
      toast.error('Failed to delete blackout date')
    } finally {
      setIsSaving(false)
    }
  }

  const sortedBlackouts = [...blackoutDates].sort(
    (a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarX className="h-5 w-5" />
            Blackout Dates
          </CardTitle>
          {!isAdding && (
            <Button onClick={handleAdd} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Blackout
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Add form */}
          {isAdding && (
            <div className="space-y-4 border rounded-lg p-4 bg-muted/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DatePickerField
                  id="start-date"
                  label="Start Date"
                  value={startDate}
                  onValueChange={setStartDate}
                  required
                  closeOnSelect
                />
                <DatePickerField
                  id="end-date"
                  label="End Date"
                  value={endDate}
                  onValueChange={setEndDate}
                  required
                  closeOnSelect
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason (Optional)</Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g., Vacation, Out of town, Personal commitment..."
                  rows={2}
                />
              </div>
              <div className="flex gap-3">
                <Button onClick={handleSave} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
                <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* List of blackout dates */}
          {sortedBlackouts.length === 0 && !isAdding ? (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarX className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No blackout dates set</p>
              <Button variant="link" onClick={handleAdd} className="mt-2">
                Add your first blackout date
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedBlackouts.map((blackout) => {
                const isPast = new Date(blackout.end_date) < new Date()
                const isActive = new Date(blackout.start_date) <= new Date() && new Date(blackout.end_date) >= new Date()

                return (
                  <div
                    key={blackout.id}
                    className={`p-4 rounded-lg border ${
                      isPast ? 'bg-muted/50 opacity-60' : isActive ? 'border-orange-500/50 bg-orange-50/50 dark:bg-orange-950/20' : 'bg-card'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <div className="font-medium">
                            {formatDate(blackout.start_date)} -{' '}
                            {formatDate(blackout.end_date)}
                          </div>
                          {isPast && (
                            <Badge variant="secondary" className="text-xs">
                              Past
                            </Badge>
                          )}
                          {isActive && (
                            <Badge variant="destructive" className="text-xs">
                              Active
                            </Badge>
                          )}
                        </div>
                        {blackout.reason && (
                          <div className="text-sm text-muted-foreground">
                            {blackout.reason}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(blackout.id)}
                        disabled={isSaving}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
