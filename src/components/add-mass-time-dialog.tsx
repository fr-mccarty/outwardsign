"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DatePickerField } from "@/components/date-picker-field"
import { TimePickerField } from "@/components/time-picker-field"
import { LocationPickerField } from "@/components/location-picker-field"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toLocalDateString } from "@/lib/utils/formatters"
import { createCalendarEvent } from "@/lib/actions/calendar-events"
import { toast } from "sonner"
import type { Location, InputFieldDefinition } from "@/lib/types"

interface AddMassTimeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  masterEventId: string
  calendarEventFieldDefinitions: InputFieldDefinition[]
  onMassTimeAdded?: () => void
}

export function AddMassTimeDialog({
  open,
  onOpenChange,
  masterEventId,
  calendarEventFieldDefinitions,
  onMassTimeAdded
}: AddMassTimeDialogProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [showLocationPicker, setShowLocationPicker] = useState(false)

  // Form state
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [time, setTime] = useState("")
  const [location, setLocation] = useState<Location | null>(null)
  const [showOnCalendar, setShowOnCalendar] = useState(true)
  const [selectedFieldDefinitionId, setSelectedFieldDefinitionId] = useState<string>(
    calendarEventFieldDefinitions[0]?.id || ""
  )

  const resetForm = () => {
    setDate(undefined)
    setTime("")
    setLocation(null)
    setShowOnCalendar(true)
    setSelectedFieldDefinitionId(calendarEventFieldDefinitions[0]?.id || "")
  }

  const handleSave = async () => {
    if (!date) {
      toast.error("Please select a date")
      return
    }
    if (!time) {
      toast.error("Please select a time")
      return
    }
    if (!selectedFieldDefinitionId) {
      toast.error("Please select a mass time type")
      return
    }

    setIsSaving(true)
    try {
      // Combine date and time into ISO datetime
      const dateStr = toLocalDateString(date)
      const startDatetime = `${dateStr}T${time}:00`

      await createCalendarEvent(masterEventId, {
        input_field_definition_id: selectedFieldDefinitionId,
        start_datetime: startDatetime,
        location_id: location?.id || null,
        show_on_calendar: showOnCalendar,
        is_cancelled: false,
        is_all_day: false
      })

      toast.success("Mass time added successfully")
      resetForm()
      onOpenChange(false)
      router.refresh()
      onMassTimeAdded?.()
    } catch (error) {
      console.error("Error adding mass time:", error)
      toast.error("Failed to add mass time")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    resetForm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Mass Time</DialogTitle>
          <DialogDescription>
            Add a new mass time to this liturgy.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Mass Time Type Selector (if multiple options) */}
          {calendarEventFieldDefinitions.length > 1 && (
            <div className="space-y-2">
              <Label>Mass Time Type</Label>
              <Select
                value={selectedFieldDefinitionId}
                onValueChange={setSelectedFieldDefinitionId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {calendarEventFieldDefinitions.map((field) => (
                    <SelectItem key={field.id} value={field.id}>
                      {field.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Date */}
          <DatePickerField
            id="mass-time-date"
            label="Date"
            value={date}
            onValueChange={setDate}
            closeOnSelect
          />

          {/* Time */}
          <TimePickerField
            id="mass-time-time"
            label="Time"
            value={time}
            onChange={setTime}
          />

          {/* Location */}
          <LocationPickerField
            label="Location"
            value={location}
            onValueChange={setLocation}
            showPicker={showLocationPicker}
            onShowPickerChange={setShowLocationPicker}
            placeholder="Select location (optional)"
          />

          {/* Show on Calendar */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show-on-calendar">Show on Calendar</Label>
              <p className="text-xs text-muted-foreground">
                Make this the primary time shown on the parish calendar
              </p>
            </div>
            <Switch
              id="show-on-calendar"
              checked={showOnCalendar}
              onCheckedChange={setShowOnCalendar}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Adding..." : "Add Mass Time"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
