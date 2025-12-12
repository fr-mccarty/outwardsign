"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DatePickerField } from "@/components/date-picker-field"
import { TimePickerField } from "@/components/time-picker-field"
import { LocationPickerField } from "@/components/location-picker-field"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { toLocalDateString, formatDatePretty, formatTime } from "@/lib/utils/formatters"
import { updateOccasion, createOccasion } from "@/lib/actions/occasions"
import { toast } from "sonner"
import { Pencil, Calendar, Clock, MapPin } from "lucide-react"
import type { Location } from "@/lib/types"

export interface OccasionFieldData {
  date: string
  time: string
  location_id: string | null
  location?: Location | null
}

interface OccasionFieldViewProps {
  label: string
  value: OccasionFieldData
  onValueChange: (value: OccasionFieldData) => void
  required?: boolean
  isPrimary?: boolean
  occasionId?: string  // If provided, will update; otherwise will create
  eventId?: string     // Required for creating new occasions
  isEditing?: boolean  // If true, show display view with modal (even without occasionId)
}

export function OccasionFieldView({
  label,
  value,
  onValueChange,
  required = false,
  isPrimary = false,
  occasionId,
  eventId,
  isEditing = false
}: OccasionFieldViewProps) {
  const router = useRouter()
  const [showLocationPicker, setShowLocationPicker] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Local state for editing in the dialog
  const [editValue, setEditValue] = useState<OccasionFieldData>(value)

  // Use display view with modal if we're in edit mode (editing an existing event)
  const useDisplayMode = isEditing

  const updateLocalValue = (key: keyof OccasionFieldData, newValue: string | Location | null) => {
    if (key === 'location' && typeof newValue === 'object') {
      setEditValue(prev => ({
        ...prev,
        location: newValue,
        location_id: newValue?.id || null
      }))
    } else if (key === 'date' || key === 'time') {
      setEditValue(prev => ({
        ...prev,
        [key]: typeof newValue === 'string' ? newValue : ''
      }))
    }
  }

  // For create mode - update parent directly
  const updateValue = (key: keyof OccasionFieldData, newValue: string | Location | null) => {
    if (key === 'location' && typeof newValue === 'object') {
      onValueChange({
        ...value,
        location: newValue,
        location_id: newValue?.id || null
      })
    } else if (key === 'date' || key === 'time') {
      onValueChange({
        ...value,
        [key]: typeof newValue === 'string' ? newValue : ''
      })
    }
  }

  const handleOpenDialog = () => {
    setEditValue(value) // Reset to current value when opening
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      if (occasionId) {
        // Update existing occasion
        await updateOccasion(occasionId, {
          date: editValue.date || null,
          time: editValue.time || null,
          location_id: editValue.location_id || null
        })
        toast.success("Occasion updated")
      } else if (eventId) {
        // Create new occasion
        await createOccasion(eventId, {
          label: label,
          date: editValue.date || null,
          time: editValue.time || null,
          location_id: editValue.location_id || null,
          is_primary: isPrimary
        })
        toast.success("Occasion created")
      } else {
        throw new Error("Cannot save: missing event ID")
      }
      onValueChange(editValue) // Update parent state
      setIsDialogOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Error saving occasion:', error)
      toast.error("Failed to save occasion")
    } finally {
      setIsSaving(false)
    }
  }

  // Display mode: show read-only view with Edit button and modal
  if (useDisplayMode) {
    const hasData = value.date || value.time || value.location

    return (
      <>
        <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">
                {label}
                {required && <span className="text-destructive ml-1">*</span>}
              </label>
              {isPrimary && (
                <span className="text-xs text-muted-foreground">(Primary)</span>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleOpenDialog}
            >
              <Pencil className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </div>

          {/* Display View */}
          {hasData ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{value.date ? formatDatePretty(value.date) : "No date set"}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{value.time ? formatTime(value.time) : "No time set"}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{value.location?.name || "No location set"}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No date, time, or location set. Click Edit to add details.</p>
          )}
        </div>

        {/* Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit {label}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DatePickerField
                  id={`${label}-date`}
                  label="Date"
                  value={editValue.date ? new Date(editValue.date + 'T12:00:00') : undefined}
                  onValueChange={(date) => updateLocalValue('date', date ? toLocalDateString(date) : '')}
                  required={required}
                  closeOnSelect
                />
                <TimePickerField
                  id={`${label}-time`}
                  label="Time"
                  value={editValue.time || ''}
                  onChange={(time) => updateLocalValue('time', time)}
                />
              </div>
              <LocationPickerField
                label="Location"
                value={editValue.location || null}
                onValueChange={(location) => updateLocalValue('location', location)}
                showPicker={showLocationPicker}
                onShowPickerChange={setShowLocationPicker}
                placeholder="Select location"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  // Create mode: show inline inputs
  return (
    <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
        {isPrimary && (
          <span className="text-xs text-muted-foreground">(Primary)</span>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DatePickerField
          id={`${label}-date`}
          label="Date"
          value={value.date ? new Date(value.date + 'T12:00:00') : undefined}
          onValueChange={(date) => updateValue('date', date ? toLocalDateString(date) : '')}
          required={required}
          closeOnSelect
        />
        <TimePickerField
          id={`${label}-time`}
          label="Time"
          value={value.time || ''}
          onChange={(time) => updateValue('time', time)}
        />
      </div>
      <LocationPickerField
        label="Location"
        value={value.location || null}
        onValueChange={(location) => updateValue('location', location)}
        showPicker={showLocationPicker}
        onShowPickerChange={setShowLocationPicker}
        placeholder="Select location"
      />
    </div>
  )
}
