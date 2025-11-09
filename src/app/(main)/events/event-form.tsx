"use client"

import { useState, useEffect } from "react"
import { FormField } from "@/components/ui/form-field"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createEvent, updateEvent, type CreateEventData } from "@/lib/actions/events"
import type { Event, Person } from "@/lib/types"
import { useRouter } from "next/navigation"
import { toast } from 'sonner'
import { EVENT_TYPE_VALUES, EVENT_TYPE_LABELS } from "@/lib/constants"
import { FormBottomActions } from "@/components/form-bottom-actions"
import { PeoplePicker } from "@/components/people-picker"
import { usePickerState } from "@/hooks/use-picker-state"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface EventFormProps {
  event?: Event
  formId?: string
  onLoadingChange?: (loading: boolean) => void
}

export function EventForm({ event, formId, onLoadingChange }: EventFormProps) {
  const router = useRouter()
  const isEditing = !!event
  const [isLoading, setIsLoading] = useState(false)

  // Notify parent component of loading state changes
  useEffect(() => {
    onLoadingChange?.(isLoading)
  }, [isLoading, onLoadingChange])
  const [name, setName] = useState(event?.name || "")
  const [description, setDescription] = useState(event?.description || "")
  const [eventType, setEventType] = useState(event?.event_type || "EVENT")
  const [startDate, setStartDate] = useState(event?.start_date || "")
  const [startTime, setStartTime] = useState(event?.start_time || "")
  const [endDate, setEndDate] = useState(event?.end_date || "")
  const [endTime, setEndTime] = useState(event?.end_time || "")
  const [location, setLocation] = useState(event?.location || "")
  const [language, setLanguage] = useState(event?.language || "")
  const [notes, setNotes] = useState(event?.note || "")

  // Responsible party picker state
  const responsibleParty = usePickerState<Person>()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const eventData: CreateEventData = {
        name,
        description: description || undefined,
        responsible_party_id: responsibleParty.value?.id || undefined,
        event_type: eventType,
        start_date: startDate || undefined,
        start_time: startTime || undefined,
        end_date: endDate || undefined,
        end_time: endTime || undefined,
        location: location || undefined,
        language: language || undefined,
        note: notes || undefined,
      }

      if (isEditing) {
        await updateEvent(event.id, eventData)
        toast.success('Event updated successfully')
        router.refresh() // Refresh to get updated data
      } else {
        const newEvent = await createEvent(eventData)
        toast.success('Event created successfully!')
        router.push(`/events/${newEvent.id}`)
      }
    } catch (error) {
      console.error(`Failed to ${isEditing ? 'update' : 'create'} event:`, error)
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} event. Please try again.`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} id={formId} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>General event details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            id="name"
            label="Event Name"
            value={name}
            onChange={setName}
            required
            placeholder="Enter event name"
          />

          <FormField
            id="description"
            label="Description"
            inputType="textarea"
            value={description}
            onChange={setDescription}
            placeholder="Enter event description..."
            rows={3}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="event_type">
                Event Type <span className="text-destructive">*</span>
              </Label>
              <Select value={eventType} onValueChange={setEventType} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPE_VALUES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {EVENT_TYPE_LABELS[type].en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsible_party">Responsible Party</Label>
              {responsibleParty.value ? (
                <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                  <span className="text-sm">
                    {responsibleParty.value.first_name} {responsibleParty.value.last_name}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => responsibleParty.setValue(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => responsibleParty.setShowPicker(true)}
                  className="w-full"
                >
                  Select Responsible Party
                </Button>
              )}
              <p className="text-sm text-muted-foreground">
                Person responsible for organizing this event
              </p>
            </div>
          </div>

          <PeoplePicker
            open={responsibleParty.showPicker}
            onOpenChange={responsibleParty.setShowPicker}
            onSelect={(person) => responsibleParty.setValue(person)}
          />
        </CardContent>
      </Card>

      {/* Date & Time */}
      <Card>
        <CardHeader>
          <CardTitle>Date & Time</CardTitle>
          <CardDescription>When the event takes place</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              id="start_date"
              label="Start Date"
              inputType="date"
              value={startDate}
              onChange={setStartDate}
            />

            <FormField
              id="start_time"
              label="Start Time"
              inputType="time"
              value={startTime}
              onChange={setStartTime}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              id="end_date"
              label="End Date"
              inputType="date"
              value={endDate}
              onChange={setEndDate}
            />

            <FormField
              id="end_time"
              label="End Time"
              inputType="time"
              value={endTime}
              onChange={setEndTime}
            />
          </div>
        </CardContent>
      </Card>

      {/* Details */}
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>Location and language information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              id="location"
              label="Location"
              value={location}
              onChange={setLocation}
              placeholder="Enter event location"
            />

            <FormField
              id="language"
              label="Language"
              value={language}
              onChange={setLanguage}
              placeholder="e.g., English, Spanish"
            />
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
          <CardDescription>Notes and other details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            id="notes"
            label="Notes"
            inputType="textarea"
            value={notes}
            onChange={setNotes}
            placeholder="Enter any additional notes..."
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Event Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Provide a clear and descriptive event name</li>
            <li>• Specify the event type for better organization</li>
            <li>• Include start date and time for scheduling</li>
            <li>• Add location information for attendees</li>
            <li>• Assign a responsible party to manage the event</li>
          </ul>
        </CardContent>
      </Card>

      <FormBottomActions
        isEditing={isEditing}
        isLoading={isLoading}
        cancelHref={isEditing ? `/events/${event.id}` : "/events"}
        saveLabel={isEditing ? "Save Changes" : "Create Event"}
      />
    </form>
  )
}
