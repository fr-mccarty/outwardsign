"use client"

import { useState, useEffect } from "react"
import { FormField } from "@/components/ui/form-field"
import { FormSectionCard } from "@/components/form-section-card"
import { createEvent, updateEvent, type CreateEventData, type EventWithRelations } from "@/lib/actions/events"
import type { Person, Location } from "@/lib/types"
import { useRouter } from "next/navigation"
import { toast } from 'sonner'
import { LITURGICAL_LANGUAGE_VALUES, LITURGICAL_LANGUAGE_LABELS, type EventType, type LiturgicalLanguage } from "@/lib/constants"
import { FormBottomActions } from "@/components/form-bottom-actions"
import { PersonPickerField } from "@/components/person-picker-field"
import { LocationPickerField } from "@/components/location-picker-field"
import { usePickerState } from "@/hooks/use-picker-state"

interface EventFormProps {
  event?: EventWithRelations
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
  const [eventType, setEventType] = useState<EventType>(event?.event_type || "EVENT")
  const [startDate, setStartDate] = useState(event?.start_date || "")
  const [startTime, setStartTime] = useState(event?.start_time || "")
  const [endDate, setEndDate] = useState(event?.end_date || "")
  const [endTime, setEndTime] = useState(event?.end_time || "")
  const [language, setLanguage] = useState<LiturgicalLanguage>(event?.language || "en")
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

        <PersonPickerField
          label="Responsible Party"
          value={responsibleParty.value}
          onValueChange={responsibleParty.setValue}
          showPicker={responsibleParty.showPicker}
          onShowPickerChange={responsibleParty.setShowPicker}
          description="Person responsible for organizing this event"
          placeholder="Select Responsible Party"
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
            onChange={(value) => setLanguage(value as LiturgicalLanguage)}
            options={LITURGICAL_LANGUAGE_VALUES.map((lang) => ({
              value: lang,
              label: LITURGICAL_LANGUAGE_LABELS[lang].en
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
        moduleName="Event"
      />
    </form>
  )
}
