"use client"

import { useState, useEffect } from "react"
import { FormField } from "@/components/ui/form-field"
import { Label } from "@/components/ui/label"
import { FormSectionCard } from "@/components/form-section-card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createEvent, updateEvent, type CreateEventData, type EventWithRelations } from "@/lib/actions/events"
import type { Person, Location } from "@/lib/types"
import { useRouter } from "next/navigation"
import { toast } from 'sonner'
import { EVENT_TYPE_VALUES, EVENT_TYPE_LABELS, LANGUAGE_VALUES, LANGUAGE_LABELS, type EventType, type Language } from "@/lib/constants"
import { FormBottomActions } from "@/components/form-bottom-actions"
import { PeoplePicker } from "@/components/people-picker"
import { LocationPickerField } from "@/components/location-picker-field"
import { usePickerState } from "@/hooks/use-picker-state"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { useAppContext } from '@/contexts/AppContextProvider'

interface EventFormProps {
  event?: EventWithRelations
  formId?: string
  onLoadingChange?: (loading: boolean) => void
}

export function EventForm({ event, formId, onLoadingChange }: EventFormProps) {
  const router = useRouter()
  const { userSettings } = useAppContext()
  const userLanguage = (userSettings?.language || 'en') as 'en' | 'es'
  const isEditing = !!event
  const [isLoading, setIsLoading] = useState(false)

  // Notify parent component of loading state changes
  useEffect(() => {
    onLoadingChange?.(isLoading)
  }, [isLoading, onLoadingChange])
  const [name, setName] = useState(event?.name || "")
  const [description, setDescription] = useState(event?.description || "")
  const [eventType, setEventType] = useState<EventType>(event?.event_type || "EVENT")
  const [startDate, setStartDate] = useState(event?.start_date || "")
  const [startTime, setStartTime] = useState(event?.start_time || "")
  const [endDate, setEndDate] = useState(event?.end_date || "")
  const [endTime, setEndTime] = useState(event?.end_time || "")
  const [language, setLanguage] = useState<Language>(event?.language || "ENGLISH")
  const [notes, setNotes] = useState(event?.note || "")

  // Responsible party picker state
  const responsibleParty = usePickerState<Person>()

  // Location picker state - initialize with existing location if editing
  const location = usePickerState<Location>()

  // Initialize location picker with existing location data
  useEffect(() => {
    if (event?.location && !location.value) {
      location.setValue(event.location)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event?.location])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Validate required fields (Radix Select doesn't support HTML5 validation)
    if (!eventType) {
      toast.error('Please select an event type')
      setIsLoading(false)
      return
    }

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
        location_id: location.value?.id || undefined,
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
        router.push(`/events/${newEvent.id}/edit`)
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
      <FormSectionCard
        title="Basic Information"
        description="General event details"
      >
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
            <Select value={eventType} onValueChange={(value) => setEventType(value as EventType)}>
              <SelectTrigger id="event_type">
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPE_VALUES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {EVENT_TYPE_LABELS[type][userLanguage]}
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
      </FormSectionCard>

      {/* Date & Time */}
      <FormSectionCard
        title="Date & Time"
        description="When the event takes place"
      >
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
      </FormSectionCard>

      {/* Details */}
      <FormSectionCard
        title="Details"
        description="Location and language information"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LocationPickerField
            label="Location"
            value={location.value}
            onValueChange={location.setValue}
            showPicker={location.showPicker}
            onShowPickerChange={location.setShowPicker}
            description="Where the event will take place"
            placeholder="Select Location"
            openToNewLocation={!isEditing}
          />

          <FormField
            id="language"
            label="Language"
            inputType="select"
            value={language}
            onChange={(value) => setLanguage(value as Language)}
            options={LANGUAGE_VALUES.map((lang) => ({
              value: lang,
              label: LANGUAGE_LABELS[lang].en
            }))}
          />
        </div>
      </FormSectionCard>

      {/* Additional Information */}
      <FormSectionCard
        title="Additional Information"
        description="Notes and other details"
      >
        <FormField
          id="notes"
          label="Notes"
          inputType="textarea"
          value={notes}
          onChange={setNotes}
          placeholder="Enter any additional notes..."
          rows={4}
        />
      </FormSectionCard>

      <FormBottomActions
        isEditing={isEditing}
        isLoading={isLoading}
        cancelHref={isEditing ? `/events/${event.id}` : "/events"}
        saveLabel={isEditing ? "Save Changes" : "Create Event"}
      />
    </form>
  )
}
