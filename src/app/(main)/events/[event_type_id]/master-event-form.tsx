"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { FormSectionCard } from "@/components/form-section-card"
import { FormInput } from "@/components/form-input"
import { DatePickerField } from "@/components/date-picker-field"
import { TimePickerField } from "@/components/time-picker-field"
import { PersonPickerField } from "@/components/person-picker-field"
import { LocationPickerField } from "@/components/location-picker-field"
import { ContentPickerField } from "@/components/content-picker-field"
import { PetitionPickerField } from "@/components/petition-picker-field"
import { GroupPickerField } from "@/components/group-picker-field"
import { ListItemPickerField } from "@/components/list-item-picker-field"
import { DocumentPickerField } from "@/components/document-picker-field"
import { CalendarEventFieldView, type CalendarEventFieldData } from "@/components/calendar-event-field-view"
import { createEvent, updateEvent } from "@/lib/actions/master-events"
import type { MasterEventWithRelations, EventTypeWithRelations, InputFieldDefinition, Person, Location, ContentWithTags, Petition, Document, TemplateData } from "@/lib/types"
import type { Group } from "@/lib/actions/groups"
import { useRouter } from "next/navigation"
import { toast } from 'sonner'
import { FormBottomActions } from "@/components/form-bottom-actions"
import { toLocalDateString } from "@/lib/utils/formatters"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface MasterEventFormProps {
  event?: MasterEventWithRelations
  eventType: EventTypeWithRelations
  formId?: string
  onLoadingChange?: (loading: boolean) => void
  templateData?: TemplateData  // Template data to pre-fill the form
}

interface FieldValues {
  [key: string]: string | boolean | null | undefined
}

export function MasterEventForm({ event, eventType, formId, onLoadingChange, templateData }: MasterEventFormProps) {
  const router = useRouter()
  const isEditing = !!event

  // Get calendar event fields from input definitions
  const calendarEventFields = (eventType.input_field_definitions || []).filter(f => f.type === 'calendar_event')

  // State for field values (non-calendar-event fields)
  const [fieldValues, setFieldValues] = useState<FieldValues>(() => {
    const initial: FieldValues = {}
    // Initialize from template, existing event, or empty (skip calendar event fields)
    eventType.input_field_definitions?.forEach((field) => {
      if (field.type !== 'calendar_event') {
        // Priority: existing event > template > default
        if (event?.field_values?.[field.name] !== undefined) {
          initial[field.name] = event.field_values[field.name]
        } else if (templateData?.field_values?.[field.name] !== undefined) {
          initial[field.name] = templateData.field_values[field.name]
        } else {
          initial[field.name] = field.type === 'yes_no' ? false : ''
        }
      }
    })
    return initial
  })

  // State for calendar event field values (keyed by field name)
  const [calendarEventValues, setCalendarEventValues] = useState<Record<string, CalendarEventFieldData>>(() => {
    const initial: Record<string, CalendarEventFieldData> = {}
    // Initialize calendar event fields from existing calendar events or template
    calendarEventFields.forEach((field) => {
      // Match calendar event to field by input_field_definition_id
      const existingCalendarEvent = event?.calendar_events?.find(ce => ce.input_field_definition_id === field.id)
      const templateCalendarEvent = templateData?.calendar_events?.[field.name]

      // Parse start_datetime into date and time components
      let date = ''
      let time = ''
      let is_all_day = false
      let location_id: string | null = null
      let location: Location | null = null

      if (existingCalendarEvent) {
        // Priority: existing event
        if (existingCalendarEvent.start_datetime) {
          const dt = new Date(existingCalendarEvent.start_datetime)
          date = toLocalDateString(dt)
          time = dt.toTimeString().slice(0, 8) // HH:MM:SS
        }
        is_all_day = existingCalendarEvent.is_all_day || false
        location_id = existingCalendarEvent.location_id
        location = existingCalendarEvent.location || null
      } else if (templateCalendarEvent) {
        // Use template calendar event data (but not datetimes - user must set those)
        is_all_day = templateCalendarEvent.is_all_day
        location_id = templateCalendarEvent.location_id
        // Note: location will be resolved when the form loads
      }

      initial[field.name] = {
        date,
        time,
        is_all_day,
        location_id,
        location
      }
    })
    return initial
  })

  // State for picker values (person, location, content, petition, group, document references)
  const [pickerValues, setPickerValues] = useState<Record<string, Person | Location | ContentWithTags | Petition | Group | Document | null>>(() => {
    const initial: Record<string, Person | Location | ContentWithTags | Petition | Group | Document | null> = {}
    // Initialize from resolved fields if editing
    if (event?.resolved_fields) {
      eventType.input_field_definitions?.forEach((field) => {
        if (field.type === 'person' || field.type === 'location' || field.type === 'content' || field.type === 'petition' || field.type === 'group' || field.type === 'document') {
          const resolved = event.resolved_fields?.[field.name]
          if (resolved?.resolved_value) {
            initial[field.name] = resolved.resolved_value as Person | Location | ContentWithTags | Petition | Group | Document
          }
        }
      })
    }
    return initial
  })

  // State for picker visibility
  const [pickerOpen, setPickerOpen] = useState<Record<string, boolean>>({})

  // Initialize React Hook Form (for form submission handling)
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useForm()

  // Notify parent component of loading state changes
  useEffect(() => {
    onLoadingChange?.(isSubmitting)
  }, [isSubmitting, onLoadingChange])

  // Update field value
  const updateFieldValue = (fieldName: string, value: string | boolean | null) => {
    setFieldValues(prev => ({ ...prev, [fieldName]: value }))
  }

  // Update picker value (stores the ID in fieldValues)
  const updatePickerValue = (fieldName: string, value: Person | Location | ContentWithTags | Petition | Group | Document | null) => {
    setPickerValues(prev => ({ ...prev, [fieldName]: value }))
    setFieldValues(prev => ({ ...prev, [fieldName]: value?.id || null }))
  }

  // Update list item value (stores the ID in fieldValues, also gets the item for display)
  const updateListItemValue = (fieldName: string, itemId: string | null) => {
    setFieldValues(prev => ({ ...prev, [fieldName]: itemId }))
  }

  // Update calendar event field value
  const updateCalendarEventValue = (fieldName: string, value: CalendarEventFieldData) => {
    setCalendarEventValues(prev => ({
      ...prev,
      [fieldName]: value
    }))
  }

  // Handle form submission
  const onSubmit = async () => {
    // Validate required fields (non-calendar_event fields)
    const missingRequired: string[] = []
    eventType.input_field_definitions?.forEach((field) => {
      if (field.type !== 'calendar_event' && field.required && !fieldValues[field.name]) {
        missingRequired.push(field.name)
      }
    })

    // Validate required calendar event fields (must have at least a date)
    calendarEventFields.forEach((field) => {
      if (field.required && !calendarEventValues[field.name]?.date) {
        missingRequired.push(`${field.name} (Date)`)
      }
    })

    if (missingRequired.length > 0) {
      toast.error(`Please fill in required fields: ${missingRequired.join(', ')}`)
      return
    }

    // Build calendar events array from calendar event field values
    // Convert date + time to start_datetime (ISO 8601)
    const toStartDatetime = (date: string, time: string | null): string => {
      if (date && time) {
        return new Date(`${date}T${time}`).toISOString()
      } else if (date) {
        // Default to noon if no time provided
        return new Date(`${date}T12:00:00`).toISOString()
      }
      // Fallback to now
      return new Date().toISOString()
    }

    const calendar_events = calendarEventFields.map((field) => ({
      input_field_definition_id: field.id,
      start_datetime: toStartDatetime(
        calendarEventValues[field.name]?.date || new Date().toISOString().split('T')[0],
        calendarEventValues[field.name]?.time || null
      ),
      location_id: calendarEventValues[field.name]?.location_id || null,
      is_primary: field.is_primary
    }))

    // Ensure at least one calendar event exists
    // If no calendar event fields defined, find the primary calendar event field or create a default
    if (calendar_events.length === 0) {
      // Find any calendar_event input field definition to use as the primary
      const primaryCalendarField = eventType.input_field_definitions?.find(
        f => f.type === 'calendar_event' && f.is_primary
      ) || eventType.input_field_definitions?.find(f => f.type === 'calendar_event')

      if (primaryCalendarField) {
        calendar_events.push({
          input_field_definition_id: primaryCalendarField.id,
          start_datetime: new Date().toISOString(),
          location_id: null,
          is_primary: true
        })
      } else {
        // This shouldn't happen in practice - event types should have calendar event fields
        throw new Error('No calendar event field defined for this event type')
      }
    }

    if (!isEditing) {
      // Create event with calendar events from calendar event fields
      try {
        const newEvent = await createEvent(eventType.id, {
          field_values: fieldValues,
          calendar_events
        })
        toast.success(`${eventType.name} created successfully`)
        router.push(`/events/${eventType.slug}/${newEvent.id}`)
      } catch (error) {
        console.error('Error creating event:', error)
        toast.error(`Failed to create ${eventType.name.toLowerCase()}`)
      }
    } else {
      // Update event with field values and calendar events
      try {
        await updateEvent(event.id, {
          field_values: fieldValues,
          calendar_events
        })
        toast.success(`${eventType.name} updated successfully`)
        router.refresh()
      } catch (error) {
        console.error('Error updating event:', error)
        toast.error(`Failed to update ${eventType.name.toLowerCase()}`)
      }
    }
  }

  // Render field based on type
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
            showPicker={pickerOpen[field.name] || false}
            onShowPickerChange={(open) => setPickerOpen(prev => ({ ...prev, [field.name]: open }))}
            required={field.required}
            placeholder={`Select ${field.name}`}
          />
        )

      case 'location':
        return (
          <LocationPickerField
            key={field.id}
            label={field.name}
            value={pickerValues[field.name] as Location | null}
            onValueChange={(location) => updatePickerValue(field.name, location)}
            showPicker={pickerOpen[field.name] || false}
            onShowPickerChange={(open) => setPickerOpen(prev => ({ ...prev, [field.name]: open }))}
            required={field.required}
            placeholder={`Select ${field.name}`}
          />
        )

      case 'content':
        return (
          <ContentPickerField
            key={field.id}
            label={field.name}
            value={pickerValues[field.name] as ContentWithTags | null}
            onValueChange={(content) => updatePickerValue(field.name, content)}
            showPicker={pickerOpen[field.name] || false}
            onShowPickerChange={(open) => setPickerOpen(prev => ({ ...prev, [field.name]: open }))}
            required={field.required}
            placeholder={`Select ${field.name}`}
            defaultFilterTags={field.filter_tags || []}
          />
        )

      case 'petition':
        return (
          <PetitionPickerField
            key={field.id}
            label={field.name}
            value={pickerValues[field.name] as Petition | null}
            onValueChange={(petition) => updatePickerValue(field.name, petition)}
            showPicker={pickerOpen[field.name] || false}
            onShowPickerChange={(open) => setPickerOpen(prev => ({ ...prev, [field.name]: open }))}
            required={field.required}
            placeholder={`Select or create ${field.name}`}
            eventContext={{
              eventTypeName: eventType.name,
              occasionDate: Object.values(calendarEventValues)[0]?.date || new Date().toISOString().split('T')[0],
              language: 'en', // TODO: Detect from event or use parish default
            }}
          />
        )

      case 'group':
        return (
          <GroupPickerField
            key={field.id}
            label={field.name}
            value={pickerValues[field.name] as Group | null}
            onValueChange={(group) => updatePickerValue(field.name, group)}
            showPicker={pickerOpen[field.name] || false}
            onShowPickerChange={(open) => setPickerOpen(prev => ({ ...prev, [field.name]: open }))}
            required={field.required}
            placeholder={`Select ${field.name}`}
          />
        )

      case 'list_item':
        // Requires a list_id from the field definition
        if (!field.list_id) {
          return (
            <div key={field.id} className="text-sm text-destructive">
              Error: List not configured for field &quot;{field.name}&quot;
            </div>
          )
        }
        return (
          <ListItemPickerField
            key={field.id}
            label={field.name}
            listId={field.list_id}
            value={typeof value === 'string' ? value : null}
            onValueChange={(itemId) => updateListItemValue(field.name, itemId)}
            required={field.required}
            placeholder={`Select ${field.name}`}
          />
        )

      case 'document':
        return (
          <DocumentPickerField
            key={field.id}
            label={field.name}
            value={typeof value === 'string' ? value : null}
            onValueChange={(documentId, doc) => {
              setPickerValues(prev => ({ ...prev, [field.name]: doc }))
              setFieldValues(prev => ({ ...prev, [field.name]: documentId }))
            }}
            required={field.required}
            placeholder={`Upload ${field.name}`}
          />
        )

      case 'calendar_event':
        // Calendar event inputs render date, time, and location together
        // In edit mode, show display view with modal for separate save
        const existingCalendarEvent = event?.calendar_events?.find(ce => ce.input_field_definition_id === field.id)
        return (
          <CalendarEventFieldView
            key={field.id}
            label={field.name}
            value={calendarEventValues[field.name] || { date: '', time: '', location_id: null, location: null }}
            onValueChange={(value) => updateCalendarEventValue(field.name, value)}
            required={field.required}
            isPrimary={field.is_primary}
            calendarEventId={existingCalendarEvent?.id}
            masterEventId={event?.id}
            isEditing={isEditing}
          />
        )

      case 'date':
        return (
          <DatePickerField
            key={field.id}
            id={field.name}
            label={field.name}
            value={value ? new Date(value + 'T12:00:00') : undefined}
            onValueChange={(date) => updateFieldValue(field.name, date ? toLocalDateString(date) : '')}
            required={field.required}
            closeOnSelect
          />
        )

      case 'time':
        return (
          <TimePickerField
            key={field.id}
            id={field.name}
            label={field.name}
            value={typeof value === 'string' ? value : ''}
            onChange={(time) => updateFieldValue(field.name, time)}
            required={field.required}
          />
        )

      case 'yes_no':
        return (
          <div key={field.id} className="flex items-center justify-between py-2">
            <Label htmlFor={field.name} className="text-sm font-medium">
              {field.name}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Switch
              id={field.name}
              checked={!!value}
              onCheckedChange={(checked) => updateFieldValue(field.name, checked)}
            />
          </div>
        )

      case 'rich_text':
        return (
          <FormInput
            key={field.id}
            id={field.name}
            label={field.name}
            inputType="textarea"
            value={typeof value === 'string' ? value : ''}
            onChange={(val) => updateFieldValue(field.name, val)}
            required={field.required}
            rows={4}
            placeholder={`Enter ${field.name.toLowerCase()}...`}
          />
        )

      case 'number':
        return (
          <FormInput
            key={field.id}
            id={field.name}
            label={field.name}
            inputType="text"
            value={typeof value === 'string' ? value : ''}
            onChange={(val) => updateFieldValue(field.name, val)}
            required={field.required}
            placeholder={`Enter ${field.name.toLowerCase()}`}
          />
        )

      case 'spacer':
        // Visual divider - no data field
        return (
          <div key={field.id} className="border-t border-border mt-8 mb-8" />
        )

      case 'text':
      default:
        return (
          <FormInput
            key={field.id}
            id={field.name}
            label={field.name}
            value={typeof value === 'string' ? value : ''}
            onChange={(val) => updateFieldValue(field.name, val)}
            required={field.required}
            placeholder={`Enter ${field.name.toLowerCase()}`}
          />
        )
    }
  }

  // Sort fields by order
  const sortedFields = [...(eventType.input_field_definitions || [])].sort((a, b) => a.order - b.order)

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Dynamic Fields Section */}
      {sortedFields.length > 0 && (
        <FormSectionCard title="Details">
          <div className="space-y-4">
            {sortedFields.map(renderField)}
          </div>
        </FormSectionCard>
      )}

      <FormBottomActions
        isEditing={isEditing}
        isLoading={isSubmitting}
        cancelHref={isEditing ? `/events/${eventType.slug}/${event.id}` : `/events`}
        moduleName={eventType.name}
      />
    </form>
  )
}
