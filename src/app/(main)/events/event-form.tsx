"use client"

import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { FormInput } from "@/components/form-input"
import { FormSectionCard } from "@/components/form-section-card"
import { createEvent, updateEvent } from "@/lib/actions/parish-events"
import type { ParishEventWithRelations } from "@/lib/types"
import type { Person, Location, ContentWithTags, Petition, Document, Group } from "@/lib/types"
import type { LiturgicalCalendarEvent } from "@/lib/actions/liturgical-calendar"
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
import { CalendarEventField } from "@/components/calendar-event-field"
import { EventTypeSelectField } from "@/components/event-type-select-field"
import { getStatusLabel } from "@/lib/content-builders/shared/helpers"
import { FormBottomActions } from "@/components/form-bottom-actions"
import { UnsavedChangesDialog } from "@/components/unsaved-changes-dialog"
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes"
import { usePickerState } from "@/hooks/use-picker-state"
import { toLocalDateString } from "@/lib/utils/formatters"
import { FORM_SECTIONS_SPACING } from "@/lib/constants/form-spacing"

const MASTER_EVENT_STATUS_VALUES = ['PLANNING', 'ACTIVE', 'COMPLETED', 'CANCELLED'] as const
type EventStatus = typeof MASTER_EVENT_STATUS_VALUES[number]

// Simple schema for event creation/update
const eventSchema = z.object({
  status: z.enum(MASTER_EVENT_STATUS_VALUES),
  liturgical_event_id: z.string().uuid().optional().nullable(),
  event_type_id: z.string().uuid().optional().nullable(),
  field_values: z.record(z.string(), z.any()).optional().nullable(),
  note: z.string().optional().nullable(),
})

type EventFormData = z.infer<typeof eventSchema>

interface EventFormProps {
  event?: ParishEventWithRelations
  formId?: string
  onLoadingChange?: (loading: boolean) => void
  initialLiturgicalEvent?: LiturgicalCalendarEvent | null
}

export function EventForm({ event, formId, onLoadingChange, initialLiturgicalEvent }: EventFormProps) {
  const router = useRouter()
  const isEditing = !!event

  // Initialize React Hook Form
  // Note: status, liturgical_event_id, and note are form-only fields not yet in ParishEvent type
  const { handleSubmit, formState: { errors, isSubmitting, isDirty }, setValue, watch } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      status: "ACTIVE",
      liturgical_event_id: initialLiturgicalEvent?.id || undefined,
      event_type_id: event?.event_type_id || undefined,
      field_values: event?.field_values || {},
      note: undefined,
    }
  })

  // Notify parent component of loading state changes
  useEffect(() => {
    onLoadingChange?.(isSubmitting)
  }, [isSubmitting, onLoadingChange])

  // Unsaved changes warning
  const unsavedChanges = useUnsavedChanges({ isDirty: isEditing && isDirty })

  // Picker states using usePickerState hook
  const liturgicalEvent = usePickerState<LiturgicalCalendarEvent>()

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

  // Track which picker is currently open (by field name)
  const [openPicker, setOpenPicker] = useState<string | null>(null)

  // Track field validation errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Track if we've initialized to prevent infinite loops
  const initializedEventIdRef = useRef<string | null>(null)

  // Initialize form with event data when editing
  useEffect(() => {
    if (event && event.id !== initializedEventIdRef.current) {
      initializedEventIdRef.current = event.id

      // Set event type and field values
      if (event.event_type_id) {
        setEventTypeId(event.event_type_id)
      }
    }
  }, [event])

  // Initialize with liturgical event from URL param
  useEffect(() => {
    if (initialLiturgicalEvent && !event) {
      liturgicalEvent.setValue(initialLiturgicalEvent)
      setValue('liturgical_event_id', initialLiturgicalEvent.id, { shouldDirty: true })
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
        if (!et) {
          toast.error('Event type not found')
          setEventType(null)
          setInputFieldDefinitions([])
          return
        }
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
    // Clear previous errors
    setFieldErrors({})

    // Validate required custom fields if event type is selected
    if (eventTypeId && inputFieldDefinitions.length > 0) {
      const missingRequired: string[] = []
      const newErrors: Record<string, string> = {}

      inputFieldDefinitions.forEach((field) => {
        if (!field.required) return

        const value = fieldValues[field.property_name]

        // Calendar event fields need special validation
        if (field.type === 'calendar_event') {
          const calValue = value as { start_date?: string; start_time?: string } | undefined
          if (!calValue?.start_date || !calValue?.start_time) {
            missingRequired.push(field.name)
            newErrors[field.property_name] = 'This field is required'
          }
        } else if (!value) {
          missingRequired.push(field.name)
          newErrors[field.property_name] = 'This field is required'
        }
      })

      if (missingRequired.length > 0) {
        setFieldErrors(newErrors)
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
      // Separate calendar event fields from regular field values
      const calendarEventFields = inputFieldDefinitions.filter(f => f.type === 'calendar_event')
      const nonCalendarFieldValues: Record<string, any> = {}
      const calendarEvents: Array<{
        input_field_definition_id: string
        start_datetime: string
        end_datetime?: string | null
        location_id?: string | null
        show_on_calendar: boolean
        is_cancelled: boolean
        is_all_day: boolean
      }> = []

      // Build field_values without calendar event data
      for (const [key, value] of Object.entries(fieldValues)) {
        const isCalendarEventField = calendarEventFields.some(f => f.property_name === key)
        if (!isCalendarEventField) {
          nonCalendarFieldValues[key] = value
        }
      }

      // Build calendar_events array
      for (const field of calendarEventFields) {
        const calValue = fieldValues[field.property_name] as {
          start_date?: string
          start_time?: string
          end_time?: string
          location_id?: string | null
        } | undefined

        if (calValue?.start_date && calValue?.start_time) {
          // Build ISO datetime from date and time
          const startDatetime = new Date(`${calValue.start_date}T${calValue.start_time}`).toISOString()
          let endDatetime: string | null = null
          if (calValue.end_time) {
            endDatetime = new Date(`${calValue.start_date}T${calValue.end_time}`).toISOString()
          }

          calendarEvents.push({
            input_field_definition_id: field.id,
            start_datetime: startDatetime,
            end_datetime: endDatetime,
            location_id: calValue.location_id || null,
            show_on_calendar: field.is_primary, // Primary field shows on calendar
            is_cancelled: false,
            is_all_day: false
          })
        }
      }

      // Build submission data
      const submitData = {
        ...data,
        field_values: nonCalendarFieldValues,
        calendar_events: calendarEvents
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
  // Note: field.name is the display label, field.property_name is the key for field_values
  const renderField = (field: InputFieldDefinition) => {
    const value = fieldValues[field.property_name]

    switch (field.type) {
      case 'person':
        return (
          <PersonPickerField
            key={field.id}
            label={field.name}
            value={pickerValues[field.property_name] as Person | null}
            onValueChange={(person) => {
              if (fieldErrors[field.property_name]) {
                setFieldErrors(prev => {
                  const next = { ...prev }
                  delete next[field.property_name]
                  return next
                })
              }
              updatePickerValue(field.property_name, person)
            }}
            showPicker={openPicker === field.property_name}
            onShowPickerChange={(show) => setOpenPicker(show ? field.property_name : null)}
            required={field.required}
            error={fieldErrors[field.property_name]}
          />
        )
      case 'location':
        return (
          <LocationPickerField
            key={field.id}
            label={field.name}
            value={pickerValues[field.property_name] as Location | null}
            onValueChange={(location) => {
              if (fieldErrors[field.property_name]) {
                setFieldErrors(prev => {
                  const next = { ...prev }
                  delete next[field.property_name]
                  return next
                })
              }
              updatePickerValue(field.property_name, location)
            }}
            showPicker={openPicker === field.property_name}
            onShowPickerChange={(show) => setOpenPicker(show ? field.property_name : null)}
            required={field.required}
            error={fieldErrors[field.property_name]}
          />
        )
      case 'content':
        return (
          <ContentPickerField
            key={field.id}
            label={field.name}
            value={pickerValues[field.property_name] as ContentWithTags | null}
            onValueChange={(content) => {
              if (fieldErrors[field.property_name]) {
                setFieldErrors(prev => {
                  const next = { ...prev }
                  delete next[field.property_name]
                  return next
                })
              }
              updatePickerValue(field.property_name, content)
            }}
            showPicker={openPicker === field.property_name}
            onShowPickerChange={(show) => setOpenPicker(show ? field.property_name : null)}
            required={field.required}
            defaultInputFilterTags={field.input_filter_tags || []}
            error={fieldErrors[field.property_name]}
          />
        )
      case 'petition':
        return (
          <PetitionPickerField
            key={field.id}
            label={field.name}
            value={pickerValues[field.property_name] as Petition | null}
            onValueChange={(petition) => {
              if (fieldErrors[field.property_name]) {
                setFieldErrors(prev => {
                  const next = { ...prev }
                  delete next[field.property_name]
                  return next
                })
              }
              updatePickerValue(field.property_name, petition)
            }}
            showPicker={openPicker === field.property_name}
            onShowPickerChange={(show) => setOpenPicker(show ? field.property_name : null)}
            required={field.required}
            error={fieldErrors[field.property_name]}
          />
        )
      case 'group':
        return (
          <GroupPickerField
            key={field.id}
            label={field.name}
            value={pickerValues[field.property_name] as Group | null}
            onValueChange={(group) => {
              if (fieldErrors[field.property_name]) {
                setFieldErrors(prev => {
                  const next = { ...prev }
                  delete next[field.property_name]
                  return next
                })
              }
              updatePickerValue(field.property_name, group)
            }}
            showPicker={openPicker === field.property_name}
            onShowPickerChange={(show) => setOpenPicker(show ? field.property_name : null)}
            required={field.required}
            error={fieldErrors[field.property_name]}
          />
        )
      case 'document':
        const documentValue = pickerValues[field.property_name] as Document | null
        return (
          <DocumentPickerField
            key={field.id}
            label={field.name}
            value={documentValue?.id || null}
            onValueChange={(documentId, document) => {
              if (fieldErrors[field.property_name]) {
                setFieldErrors(prev => {
                  const next = { ...prev }
                  delete next[field.property_name]
                  return next
                })
              }
              updatePickerValue(field.property_name, document)
            }}
            required={field.required}
            error={fieldErrors[field.property_name]}
          />
        )
      case 'list_item':
        return (
          <ListItemPickerField
            key={field.id}
            label={field.name}
            listId={field.list_id!}
            value={value}
            onValueChange={(itemId) => {
              if (fieldErrors[field.property_name]) {
                setFieldErrors(prev => {
                  const next = { ...prev }
                  delete next[field.property_name]
                  return next
                })
              }
              setFieldValues(prev => ({ ...prev, [field.property_name]: itemId }))
            }}
            required={field.required}
            error={fieldErrors[field.property_name]}
          />
        )
      case 'text':
        return (
          <FormInput
            key={field.id}
            id={field.property_name}
            label={field.name}
            value={value || ''}
            onChange={(val) => {
              if (fieldErrors[field.property_name]) {
                setFieldErrors(prev => {
                  const next = { ...prev }
                  delete next[field.property_name]
                  return next
                })
              }
              setFieldValues(prev => ({ ...prev, [field.property_name]: val }))
            }}
            required={field.required}
            error={fieldErrors[field.property_name]}
          />
        )
      case 'rich_text':
        return (
          <FormInput
            key={field.id}
            id={field.property_name}
            inputType="textarea"
            label={field.name}
            value={value || ''}
            onChange={(val) => {
              if (fieldErrors[field.property_name]) {
                setFieldErrors(prev => {
                  const next = { ...prev }
                  delete next[field.property_name]
                  return next
                })
              }
              setFieldValues(prev => ({ ...prev, [field.property_name]: val }))
            }}
            required={field.required}
            error={fieldErrors[field.property_name]}
          />
        )
      case 'date':
        return (
          <DatePickerField
            key={field.id}
            label={field.name}
            value={value ? new Date(value) : undefined}
            onValueChange={(date) => {
              if (fieldErrors[field.property_name]) {
                setFieldErrors(prev => {
                  const next = { ...prev }
                  delete next[field.property_name]
                  return next
                })
              }
              setFieldValues(prev => ({ ...prev, [field.property_name]: date ? toLocalDateString(date) : null }))
            }}
            required={field.required}
            error={fieldErrors[field.property_name]}
          />
        )
      case 'time':
        return (
          <TimePickerField
            key={field.id}
            label={field.name}
            value={value || ''}
            onChange={(time) => {
              if (fieldErrors[field.property_name]) {
                setFieldErrors(prev => {
                  const next = { ...prev }
                  delete next[field.property_name]
                  return next
                })
              }
              setFieldValues(prev => ({ ...prev, [field.property_name]: time }))
            }}
            required={field.required}
            error={fieldErrors[field.property_name]}
          />
        )
      case 'calendar_event':
        // Calendar event fields store composite values: { start_date, start_time, location_id, location }
        const calendarEventValue = value || {}
        return (
          <CalendarEventField
            key={field.id}
            label={field.name}
            value={{
              start_date: calendarEventValue.start_date ? new Date(calendarEventValue.start_date) : undefined,
              start_time: calendarEventValue.start_time || undefined,
              end_time: calendarEventValue.end_time || undefined,
              location_id: calendarEventValue.location_id || null,
              location: pickerValues[`${field.property_name}_location`] as Location | null,
            }}
            onValueChange={(newValue) => {
              // Clear error when user starts filling in the field
              if (fieldErrors[field.property_name]) {
                setFieldErrors(prev => {
                  const next = { ...prev }
                  delete next[field.property_name]
                  return next
                })
              }
              // Store the composite value in fieldValues using property_name as key
              setFieldValues(prev => ({
                ...prev,
                [field.property_name]: {
                  start_date: newValue.start_date ? toLocalDateString(newValue.start_date) : null,
                  start_time: newValue.start_time || null,
                  end_time: newValue.end_time || null,
                  location_id: newValue.location_id || null,
                }
              }))
              // Store location object separately for display (convert undefined to null)
              setPickerValues(prev => ({ ...prev, [`${field.property_name}_location`]: newValue.location ?? null }))
            }}
            required={field.required}
            showEndTime={false}
            error={fieldErrors[field.property_name]}
          />
        )
      default:
        return null
    }
  }

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className={FORM_SECTIONS_SPACING}>
      {/* Basic Information */}
      <FormSectionCard
        title="Basic Information"
        description="Core details for this event"
      >
        <EventTypeSelectField
          value={eventTypeId}
          onChange={(value) => {
            setEventTypeId(value)
            setValue('event_type_id', value || undefined, { shouldDirty: true })
          }}
        />

        <FormInput
          id="status"
          inputType="select"
          label="Status"
          description="Current status of this event"
          value={watch('status') || 'ACTIVE'}
          onChange={(value) => setValue('status', value as EventStatus, { shouldDirty: true })}
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
            setValue('liturgical_event_id', value?.id || undefined, { shouldDirty: true })
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
          onChange={(value) => setValue('note', value || undefined, { shouldDirty: true })}
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

      <FormBottomActions
        isEditing={isEditing}
        isLoading={isSubmitting}
        cancelHref={event ? `/events/${event.id}` : '/events'}
        moduleName="event"
        isDirty={isEditing && isDirty}
        onNavigate={unsavedChanges.handleNavigation}
      />

      <UnsavedChangesDialog
        open={unsavedChanges.showDialog}
        onConfirm={unsavedChanges.confirmNavigation}
        onCancel={unsavedChanges.cancelNavigation}
      />
    </form>
  )
}
