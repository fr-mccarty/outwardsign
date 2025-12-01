"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormInput } from "@/components/form-input"
import { DatePickerField } from "@/components/date-picker-field"
import { toLocalDateString } from "@/lib/utils/formatters"
import { FormSectionCard } from "@/components/form-section-card"
import { createEvent, updateEvent, type EventWithRelations } from "@/lib/actions/events"
import { createEventSchema, type CreateEventData } from "@/lib/schemas/events"
import type { Person, Location, EventType } from "@/lib/types"
import { useRouter } from "next/navigation"
import { toast } from 'sonner'
import { LITURGICAL_LANGUAGE_VALUES, LITURGICAL_LANGUAGE_LABELS, RELATED_EVENT_TYPE_LABELS, type LiturgicalLanguage } from "@/lib/constants"
import { FormBottomActions } from "@/components/form-bottom-actions"
import { PersonPickerField } from "@/components/person-picker-field"
import { LocationPickerField } from "@/components/location-picker-field"
import { EventTypePickerField } from "@/components/event-type-picker-field"
import { usePickerState } from "@/hooks/use-picker-state"

interface EventFormProps {
  event?: EventWithRelations
  formId?: string
  onLoadingChange?: (loading: boolean) => void
}

export function EventForm({ event, formId, onLoadingChange }: EventFormProps) {
  const router = useRouter()
  const isEditing = !!event

  // Initialize form with React Hook Form
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<CreateEventData>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      name: event?.name || "",
      description: event?.description || "",
      start_date: event?.start_date || "",
      start_time: event?.start_time || "",
      end_date: event?.end_date || "",
      end_time: event?.end_time || "",
      language: event?.language || "en",
      note: event?.note || "",
    },
  })

  // Watch form values
  const name = watch("name")
  const description = watch("description")
  const startDate = watch("start_date")
  const startTime = watch("start_time")
  const endDate = watch("end_date")
  const endTime = watch("end_time")
  const language = watch("language")
  const notes = watch("note")

  // Picker states
  const responsibleParty = usePickerState<Person>()
  const location = usePickerState<Location>()
  const eventType = usePickerState<EventType>()

  // Error state for eventType picker
  const [eventTypeError, setEventTypeError] = useState<string | undefined>()

  // Notify parent component of loading state changes
  useEffect(() => {
    onLoadingChange?.(isSubmitting)
  }, [isSubmitting, onLoadingChange])

  // Initialize picker values with existing data
  useEffect(() => {
    if (event?.location && !location.value) {
      location.setValue(event.location)
    }
    if (event?.responsible_party && !responsibleParty.value) {
      responsibleParty.setValue(event.responsible_party)
    }
    if (event?.event_type && !eventType.value) {
      eventType.setValue(event.event_type)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event])

  // Sync picker values to form state
  useEffect(() => {
    setValue("responsible_party_id", responsibleParty.value?.id || undefined)
  }, [responsibleParty.value, setValue])

  useEffect(() => {
    setValue("location_id", location.value?.id || undefined)
  }, [location.value, setValue])

  useEffect(() => {
    setValue("event_type_id", eventType.value?.id || undefined)
    // Clear error when eventType is selected
    if (eventType.value) {
      setEventTypeError(undefined)
    }
  }, [eventType.value, setValue])

  const onSubmit = async (data: CreateEventData) => {
    // Validate required fields
    if (!eventType.value && !event?.related_event_type) {
      setEventTypeError('Please select an event type')
      toast.error('Please select an event type')
      return
    }

    try {
      if (isEditing) {
        await updateEvent(event.id, data)
        toast.success('Event updated successfully')
        router.refresh() // Refresh to get updated data
      } else {
        const newEvent = await createEvent(data)
        toast.success('Event created successfully!')
        router.push(`/events/${newEvent.id}/edit`)
      }
    } catch (error) {
      console.error(`Failed to ${isEditing ? 'update' : 'create'} event:`, error)
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} event. Please try again.`)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} id={formId} className="space-y-6">
      {/* Basic Information */}
      <FormSectionCard
        title="Basic Information"
        description="General event details"
      >
        <FormInput
          id="name"
          label="Event Name"
          value={name}
          onChange={(value) => setValue("name", value)}
          required
          placeholder="Enter event name"
          error={errors.name?.message}
        />

        <FormInput
          id="description"
          label="Description"
          inputType="textarea"
          value={description || ""}
          onChange={(value) => setValue("description", value)}
          placeholder="Enter event description..."
          rows={3}
          error={errors.description?.message}
        />

        {/* Show related event type as read-only if it exists (module-linked event) */}
        {event?.related_event_type ? (
          <FormInput
            id="related_event_type"
            label="Event Type"
            value={RELATED_EVENT_TYPE_LABELS[event.related_event_type]?.en || event.related_event_type}
            onChange={() => {}}
            disabled
            description="This event is linked to a module record and cannot be changed"
          />
        ) : (
          <EventTypePickerField
            label="Event Type"
            value={eventType.value}
            onValueChange={eventType.setValue}
            showPicker={eventType.showPicker}
            onShowPickerChange={eventType.setShowPicker}
            required
            description="Select or create an event type"
            error={eventTypeError}
          />
        )}

        <PersonPickerField
          label="Responsible Party"
          value={responsibleParty.value}
          onValueChange={responsibleParty.setValue}
          showPicker={responsibleParty.showPicker}
          onShowPickerChange={responsibleParty.setShowPicker}
          description="Person responsible for organizing this event"
          placeholder="Select Responsible Party"
          additionalVisibleFields={['email', 'phone_number', 'note']}
        />
      </FormSectionCard>

      {/* Date & Time */}
      <FormSectionCard
        title="Date & Time"
        description="When the event takes place"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DatePickerField
            id="start_date"
            label="Start Date"
            value={startDate ? new Date(startDate + 'T12:00:00') : undefined}
            onValueChange={(date) => setValue("start_date", date ? toLocalDateString(date) : "")}
            error={errors.start_date?.message}
            closeOnSelect
          />

          <FormInput
            id="start_time"
            label="Start Time"
            inputType="time"
            value={startTime || ""}
            onChange={(value) => setValue("start_time", value)}
            error={errors.start_time?.message}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DatePickerField
            id="end_date"
            label="End Date"
            value={endDate ? new Date(endDate + 'T12:00:00') : undefined}
            onValueChange={(date) => setValue("end_date", date ? toLocalDateString(date) : "")}
            error={errors.end_date?.message}
            closeOnSelect
          />

          <FormInput
            id="end_time"
            label="End Time"
            inputType="time"
            value={endTime || ""}
            onChange={(value) => setValue("end_time", value)}
            error={errors.end_time?.message}
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

          <FormInput
            id="language"
            label="Language"
            inputType="select"
            value={language || "en"}
            onChange={(value) => setValue("language", value as LiturgicalLanguage)}
            options={LITURGICAL_LANGUAGE_VALUES.map((lang) => ({
              value: lang,
              label: LITURGICAL_LANGUAGE_LABELS[lang].en
            }))}
            error={errors.language?.message}
          />
        </div>
      </FormSectionCard>

      {/* Additional Information */}
      <FormSectionCard
        title="Additional Information"
        description="Notes and other details"
      >
        <FormInput
          id="notes"
          label="Notes"
          inputType="textarea"
          value={notes || ""}
          onChange={(value) => setValue("note", value)}
          placeholder="Enter any additional notes..."
          rows={4}
          error={errors.note?.message}
        />
      </FormSectionCard>

      <FormBottomActions
        isEditing={isEditing}
        isLoading={isSubmitting}
        cancelHref={isEditing ? `/events/${event.id}` : "/events"}
        moduleName="Event"
      />
    </form>
  )
}
