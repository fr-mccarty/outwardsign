"use client"

import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { FormInput } from "@/components/form-input"
import { FormSectionCard } from "@/components/form-section-card"
import { createEvent, updateEvent, type MasterEventWithRelations } from "@/lib/actions/master-events"
import type { Person, Location, ContentWithTags, Petition, Document, Group } from "@/lib/types"
import type { GlobalLiturgicalEvent } from "@/lib/actions/global-liturgical-events"
import type { EventTypeWithRelations, InputFieldDefinition } from "@/lib/types/event-types"
import { getEventTypeWithRelations } from "@/lib/actions/event-types"
import { useRouter } from "next/navigation"
import { toast } from 'sonner'
import { PersonPickerField } from "@/components/person-picker-field"
import { LiturgicalEventPickerField } from "@/components/liturgical-event-picker-field"
import { LocationPickerField } from "@/components/location-picker-field"
import { ContentPickerField } from "@/components/content-picker-field"
import { PetitionPickerField } from "@/components/petition-picker-field"
import { GroupPickerField } from "@/components/group-picker-field"
import { ListItemPickerField } from "@/components/list-item-picker-field"
import { DocumentPickerField } from "@/components/document-picker-field"
import { DatePickerField } from "@/components/date-picker-field"
import { TimePickerField } from "@/components/time-picker-field"
import { EventTypeSelectField } from "@/components/event-type-select-field"
import { FormSpacer } from "@/components/form-spacer"
import { getStatusLabel } from "@/lib/content-builders/shared/helpers"
import { FormBottomActions } from "@/components/form-bottom-actions"
import { usePickerState } from "@/hooks/use-picker-state"
import { toLocalDateString } from "@/lib/utils/formatters"

const MASTER_EVENT_STATUS_VALUES = ['PLANNING', 'ACTIVE', 'COMPLETED', 'CANCELLED'] as const
type EventStatus = typeof MASTER_EVENT_STATUS_VALUES[number]

// Simple schema for event creation/update
const eventSchema = z.object({
  status: z.enum(MASTER_EVENT_STATUS_VALUES).optional().nullable(),
  liturgical_event_id: z.string().uuid().optional().nullable(),
  event_type_id: z.string().uuid().optional().nullable(),
  field_values: z.record(z.string(), z.any()).optional().nullable(),
  note: z.string().optional().nullable(),
})

type EventFormData = z.infer<typeof eventSchema>

interface EventFormProps {
  event?: MasterEventWithRelations
  formId?: string
  onLoadingChange?: (loading: boolean) => void
  initialLiturgicalEvent?: GlobalLiturgicalEvent | null
}

export function EventForm({ event, formId, onLoadingChange, initialLiturgicalEvent }: EventFormProps) {
  const router = useRouter()
  const isEditing = !!event

  // Initialize React Hook Form
  const { handleSubmit, formState: { errors, isSubmitting }, setValue, watch } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      status: event?.status || "ACTIVE",
      liturgical_event_id: event?.liturgical_event_id || initialLiturgicalEvent?.id || undefined,
      event_type_id: event?.event_type_id || undefined,
      field_values: event?.field_values || {},
      note: event?.note || undefined,
    }
  })

  // Notify parent component of loading state changes
  useEffect(() => {
    onLoadingChange?.(isSubmitting)
  }, [isSubmitting, onLoadingChange])

  // Picker states using usePickerState hook
  const liturgicalEvent = usePickerState<GlobalLiturgicalEvent>()

  // Event type templating state
  const [eventTypeId, setEventTypeId] = useState<string | null>(event?.event_type_id || null)
  const [eventType, setEventType] = useState<EventTypeWithRelations | null>(null)
  const [inputFieldDefinitions, setInputFieldDefinitions] = useState<InputFieldDefinition[]>([])
  const [fieldValues, setFieldValues] = useState<Record<string, any>>(() => {
    return event?.field_values || {}
  })
  const [pickerValues, setPickerValues] = useState<Record<string, Person | Location | ContentWithTags | Petition | Group | Document | null>>(() => {
    const initial: Record<string, Person | Location | ContentWithTags | Petition | Group | Document | null> = {}
    if (event?.resolved_fields) {
      Object.entries(event.resolved_fields).forEach(([fieldName, resolved]) => {
        if (resolved.resolved_value) {
          initial[fieldName] = resolved.resolved_value as Person | Location | ContentWithTags | Petition | Group | Document
        }
      })
    }
    return initial
  })

  // Track if we've initialized to prevent infinite loops
  const initializedEventIdRef = useRef<string | null>(null)

  // Initialize form with event data when editing
  useEffect(() => {
    if (event && event.id !== initializedEventIdRef.current) {
      initializedEventIdRef.current = event.id

      // Set liturgical event
      if (event.liturgical_event) liturgicalEvent.setValue(event.liturgical_event)

      // Set event type and field values
      if (event.event_type_id) {
        setEventTypeId(event.event_type_id)
      }
    }
  }, [event, liturgicalEvent])

  // Initialize with liturgical event from URL param
  useEffect(() => {
    if (initialLiturgicalEvent && !event) {
      liturgicalEvent.setValue(initialLiturgicalEvent)
      setValue('liturgical_event_id', initialLiturgicalEvent.id)
    }
  }, [initialLiturgicalEvent, event, liturgicalEvent, setValue])

  // Load event type when eventTypeId changes
  useEffect(() => {
    if (!eventTypeId) {
      setEventType(null)
      setInputFieldDefinitions([])
      return
    }

    const loadEventType = async () => {
      try {
        const et = await getEventTypeWithRelations(eventTypeId)
        setEventType(et)
        setInputFieldDefinitions(et.input_field_definitions || [])
      } catch (error) {
        console.error('Error loading event type:', error)
        toast.error('Failed to load event type')
      }
    }

    loadEventType()
  }, [eventTypeId])

  // Update picker value and field value together
  const updatePickerValue = (fieldName: string, value: Person | Location | ContentWithTags | Petition | Group | Document | null) => {
    setPickerValues(prev => ({ ...prev, [fieldName]: value }))
    setFieldValues(prev => ({ ...prev, [fieldName]: value?.id || null }))
  }

  // Form submission handler
  const onSubmit = async (data: EventFormData) => {
    // Validate required custom fields if event type is selected
    if (eventTypeId && inputFieldDefinitions.length > 0) {
      const missingRequired: string[] = []
      inputFieldDefinitions.forEach((field) => {
        if (field.required && !fieldValues[field.name]) {
          missingRequired.push(field.name)
        }
      })

      if (missingRequired.length > 0) {
        toast.error(`Please fill in required fields: ${missingRequired.join(', ')}`)
        return
      }
    }

    // Validate that event type is selected
    if (!eventTypeId) {
      toast.error('Please select an event type')
      return
    }

    try {
      // Include event_type_id and field_values in submission data
      const submitData = {
        ...data,
        field_values: eventTypeId ? fieldValues : undefined
      }

      if (isEditing) {
        await updateEvent(event.id, submitData)
        toast.success('Event updated successfully')
        router.push(`/events/${event.id}`)
      } else {
        const newEvent = await createEvent(eventTypeId, submitData)
        toast.success('Event created successfully')
        router.push(`/events/${newEvent.id}`)
      }
    } catch (error) {
      console.error('Error saving event:', error)
      toast.error(isEditing ? 'Failed to update event' : 'Failed to create event')
    }
  }

  // Render dynamic field based on type
  const renderField = (field: InputFieldDefinition) => {
    const value = fieldValues[field.name]

    switch (field.type) {
      case 'person':
        return (
          <PersonPickerField
            key={field.id}
            label={field.name}
            value={pickerValues[field.name] as Person | null}
            onValueChange={(person) => updatePickerValue(field.name, person)}
            required={field.required}
            description={field.description || undefined}
          />
        )
      case 'location':
        return (
          <LocationPickerField
            key={field.id}
            label={field.name}
            value={pickerValues[field.name] as Location | null}
            onValueChange={(location) => updatePickerValue(field.name, location)}
            required={field.required}
            description={field.description || undefined}
          />
        )
      case 'content':
        return (
          <ContentPickerField
            key={field.id}
            label={field.name}
            value={pickerValues[field.name] as ContentWithTags | null}
            onValueChange={(content) => updatePickerValue(field.name, content)}
            required={field.required}
            description={field.description || undefined}
          />
        )
      case 'petition':
        return (
          <PetitionPickerField
            key={field.id}
            label={field.name}
            value={pickerValues[field.name] as Petition | null}
            onValueChange={(petition) => updatePickerValue(field.name, petition)}
            required={field.required}
            description={field.description || undefined}
          />
        )
      case 'group':
        return (
          <GroupPickerField
            key={field.id}
            label={field.name}
            value={pickerValues[field.name] as Group | null}
            onValueChange={(group) => updatePickerValue(field.name, group)}
            required={field.required}
            description={field.description || undefined}
          />
        )
      case 'document':
        return (
          <DocumentPickerField
            key={field.id}
            label={field.name}
            value={pickerValues[field.name] as Document | null}
            onValueChange={(document) => updatePickerValue(field.name, document)}
            required={field.required}
            description={field.description || undefined}
          />
        )
      case 'list_item':
        return (
          <ListItemPickerField
            key={field.id}
            label={field.name}
            listId={field.list_id!}
            value={value}
            onValueChange={(itemId) => setFieldValues(prev => ({ ...prev, [field.name]: itemId }))}
            required={field.required}
            description={field.description || undefined}
          />
        )
      case 'text':
        return (
          <FormInput
            key={field.id}
            id={field.name}
            label={field.name}
            description={field.description || undefined}
            value={value || ''}
            onChange={(val) => setFieldValues(prev => ({ ...prev, [field.name]: val }))}
            required={field.required}
          />
        )
      case 'textarea':
        return (
          <FormInput
            key={field.id}
            id={field.name}
            inputType="textarea"
            label={field.name}
            description={field.description || undefined}
            value={value || ''}
            onChange={(val) => setFieldValues(prev => ({ ...prev, [field.name]: val }))}
            required={field.required}
          />
        )
      case 'date':
        return (
          <DatePickerField
            key={field.id}
            label={field.name}
            description={field.description || undefined}
            value={value ? new Date(value) : undefined}
            onValueChange={(date) => setFieldValues(prev => ({ ...prev, [field.name]: date ? toLocalDateString(date) : null }))}
            required={field.required}
          />
        )
      case 'time':
        return (
          <TimePickerField
            key={field.id}
            label={field.name}
            description={field.description || undefined}
            value={value || ''}
            onValueChange={(time) => setFieldValues(prev => ({ ...prev, [field.name]: time }))}
            required={field.required}
          />
        )
      default:
        return null
    }
  }

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <FormSectionCard
        title="Basic Information"
        description="Core details for this event"
      >
        <EventTypeSelectField
          label="Event Type"
          description="Select the type of event you are creating"
          systemType="event"
          value={eventTypeId}
          onValueChange={(value) => {
            setEventTypeId(value)
            setValue('event_type_id', value || undefined)
          }}
          required
        />

        <FormInput
          id="status"
          inputType="select"
          label="Status"
          description="Current status of this event"
          value={watch('status') || 'ACTIVE'}
          onChange={(value) => setValue('status', value as EventStatus)}
          options={MASTER_EVENT_STATUS_VALUES.map((value) => ({
            value,
            label: getStatusLabel(value, 'en')
          }))}
          error={errors.status?.message}
        />

        <LiturgicalEventPickerField
          label="Liturgical Event"
          description="Link this event to a liturgical event (feast day, solemnity, etc.)"
          value={liturgicalEvent.value}
          onValueChange={(value) => {
            liturgicalEvent.setValue(value)
            setValue('liturgical_event_id', value?.id || undefined)
          }}
          showPicker={liturgicalEvent.showPicker}
          onShowPickerChange={liturgicalEvent.setShowPicker}
        />

        <FormInput
          id="note"
          inputType="textarea"
          label="Internal Notes"
          description="Private notes for staff (not visible to public)"
          value={watch('note') || ''}
          onChange={(value) => setValue('note', value || undefined)}
          placeholder="Add any internal notes about this event..."
          error={errors.note?.message}
        />
      </FormSectionCard>

      {/* Dynamic Fields from Event Type */}
      {inputFieldDefinitions.length > 0 && (
        <FormSectionCard
          title="Event Details"
          description={`Additional fields for ${eventType?.name || 'this event'}`}
        >
          {inputFieldDefinitions.map((field) => renderField(field))}
        </FormSectionCard>
      )}

      <FormSpacer />
      <FormBottomActions />
    </form>
  )
}
