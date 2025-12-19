'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FormInput } from '@/components/form-input'
import { FormSectionCard } from '@/components/form-section-card'
import { PersonPickerField } from '@/components/person-picker-field'
import { LocationPickerField } from '@/components/location-picker-field'
import { GroupPickerField } from '@/components/group-picker-field'
import { CalendarEventField } from '@/components/calendar-event-field'
import { ContentPickerField } from '@/components/content-picker-field'
import { PetitionPickerField } from '@/components/petition-picker-field'
import { ListItemPickerField } from '@/components/list-item-picker-field'
import { DocumentPickerField } from '@/components/document-picker-field'
import { DatePickerField } from '@/components/date-picker-field'
import { TimePickerField } from '@/components/time-picker-field'
import { FormSpacer } from '@/components/form-spacer'
import { FormBottomActions } from '@/components/form-bottom-actions'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { toLocalDateString } from '@/lib/utils/formatters'
import { createEvent, updateEvent } from '@/lib/actions/master-events'
import type {
  EventTypeWithRelations,
  MasterEventWithRelations,
  InputFieldDefinition,
  Person,
  Location,
  Group,
  ContentWithTags,
  Petition,
  Document,
  CreateCalendarEventData,
  MasterEventStatus
} from '@/lib/types'

const MASTER_EVENT_STATUS_VALUES: MasterEventStatus[] = ['PLANNING', 'ACTIVE', 'SCHEDULED', 'COMPLETED', 'CANCELLED']

const masterEventSchema = z.object({
  status: z.enum(['PLANNING', 'ACTIVE', 'SCHEDULED', 'COMPLETED', 'CANCELLED']),
  presider_id: z.string().optional(),
  homilist_id: z.string().optional(),
})

type MasterEventFormData = z.infer<typeof masterEventSchema>

interface MasterEventFormProps {
  eventType: EventTypeWithRelations
  initialData?: MasterEventWithRelations
  isEditing?: boolean
  onSubmit?: (data: any) => Promise<void>
  formId?: string
  onLoadingChange?: (loading: boolean) => void
}

/**
 * MasterEventForm - Reusable form component for master events
 *
 * Dynamically renders fields based on input_field_definitions from event_type.
 * Supports person, location, group, calendar_event, text, rich_text, date, time, number, yes_no field types.
 * Stores values in field_values JSONB format.
 *
 * Per FORMS.md: Uses FormField component pattern and semantic color tokens.
 */
export function MasterEventForm({
  eventType,
  initialData,
  isEditing = false,
  onSubmit: customOnSubmit,
  formId,
  onLoadingChange
}: MasterEventFormProps) {
  const router = useRouter()

  // React Hook Form setup
  const { handleSubmit, formState: { errors, isSubmitting }, setValue, watch } = useForm<MasterEventFormData>({
    resolver: zodResolver(masterEventSchema),
    defaultValues: {
      status: initialData?.status || 'PLANNING',
      presider_id: initialData?.presider_id || undefined,
      homilist_id: initialData?.homilist_id || undefined,
    }
  })

  // Notify parent of loading state changes
  useEffect(() => {
    onLoadingChange?.(isSubmitting)
  }, [isSubmitting, onLoadingChange])

  // Field values state (for JSONB storage)
  const [fieldValues, setFieldValues] = useState<Record<string, any>>(() => {
    return initialData?.field_values || {}
  })

  // Picker values state (for UI display)
  const [pickerValues, setPickerValues] = useState<Record<string, Person | Location | Group | ContentWithTags | Petition | Document | null>>(() => {
    const initial: Record<string, Person | Location | Group | ContentWithTags | Petition | Document | null> = {}
    if (initialData?.resolved_fields) {
      Object.entries(initialData.resolved_fields).forEach(([fieldName, resolved]) => {
        if (resolved.resolved_value) {
          initial[fieldName] = resolved.resolved_value as Person | Location | Group | ContentWithTags | Petition | Document
        }
      })
    }
    return initial
  })

  // Picker open states
  const [pickerOpen, setPickerOpen] = useState<Record<string, boolean>>({})

  // Presider and Homilist pickers
  const [presider, setPresider] = useState<Person | null>(initialData?.presider || null)
  const [homilist, setHomilist] = useState<Person | null>(initialData?.homilist || null)
  const [presiderPickerOpen, setPresiderPickerOpen] = useState(false)
  const [homilistPickerOpen, setHomilstPickerOpen] = useState(false)

  // Calendar events derived from initial data (read-only for now, editing handled elsewhere)
  const calendarEvents: CreateCalendarEventData[] = initialData?.calendar_events?.map(ce => ({
    master_event_id: initialData.id,
    input_field_definition_id: ce.input_field_definition_id,
    start_datetime: ce.start_datetime,
    end_datetime: ce.end_datetime,
    location_id: ce.location_id,
    is_primary: ce.is_primary,
    is_cancelled: ce.is_cancelled,
  })) || []

  // Sync presider to form
  useEffect(() => {
    setValue('presider_id', presider?.id)
  }, [presider, setValue])

  // Sync homilist to form
  useEffect(() => {
    setValue('homilist_id', homilist?.id)
  }, [homilist, setValue])

  // Update field value (for text, rich_text, date, time, number, yes_no fields)
  const updateFieldValue = (fieldName: string, value: string | boolean | null) => {
    setFieldValues(prev => ({ ...prev, [fieldName]: value }))
  }

  // Update picker value (stores the ID in fieldValues)
  const updatePickerValue = (fieldName: string, value: Person | Location | Group | ContentWithTags | Petition | Document | null) => {
    setPickerValues(prev => ({ ...prev, [fieldName]: value }))
    setFieldValues(prev => ({ ...prev, [fieldName]: value?.id || null }))
  }

  // Update list item value
  const updateListItemValue = (fieldName: string, itemId: string | null) => {
    setFieldValues(prev => ({ ...prev, [fieldName]: itemId }))
  }

  // Update calendar event value
  const updateCalendarEventValue = (fieldDefId: string, value: any) => {
    // Store calendar event data in fieldValues for this field definition
    setFieldValues(prev => ({ ...prev, [`calendar_event_${fieldDefId}`]: value }))
  }

  // Handle form submission
  const onSubmitForm = async (data: MasterEventFormData) => {
    try {
      // Validate required fields
      const missingRequired: string[] = []
      eventType.input_field_definitions?.forEach((field) => {
        if (field.required && !fieldValues[field.property_name]) {
          missingRequired.push(field.name) // Use name for display
        }
      })

      if (missingRequired.length > 0) {
        toast.error(`Please fill in required fields: ${missingRequired.join(', ')}`)
        return
      }

      // Validate at least one calendar event exists
      if (calendarEvents.length === 0) {
        toast.error('At least one calendar event is required')
        return
      }

      // Validate exactly one primary calendar event
      const primaryEvents = calendarEvents.filter(ce => ce.is_primary)
      if (primaryEvents.length !== 1) {
        toast.error('Exactly one calendar event must be marked as primary')
        return
      }

      if (customOnSubmit) {
        // Use custom submit handler if provided
        await customOnSubmit({
          ...data,
          field_values: fieldValues,
          calendar_events: calendarEvents
        })
      } else {
        // Default submit behavior
        if (isEditing && initialData) {
          await updateEvent(initialData.id, {
            field_values: fieldValues,
            presider_id: data.presider_id || null,
            homilist_id: data.homilist_id || null,
            status: data.status,
            calendar_events: calendarEvents
          })
          toast.success('Event updated successfully')
          router.push(`/masses/${initialData.id}`)
        } else {
          const newEvent = await createEvent(eventType.id, {
            field_values: fieldValues,
            presider_id: data.presider_id || null,
            homilist_id: data.homilist_id || null,
            status: data.status,
            calendar_events: calendarEvents
          })
          toast.success('Event created successfully')
          router.push(`/masses/${newEvent.id}`)
        }
      }
    } catch (error) {
      console.error('Error saving event:', error)
      toast.error(isEditing ? 'Failed to update event' : 'Failed to create event')
    }
  }

  // Render dynamic field based on type
  // Use property_name for data storage keys, field.name for UI labels
  const renderField = (field: InputFieldDefinition) => {
    const value = fieldValues[field.property_name]

    switch (field.type) {
      case 'person':
        return (
          <PersonPickerField
            key={field.id}
            label={field.name}
            value={pickerValues[field.property_name] as Person | null}
            onValueChange={(person) => updatePickerValue(field.property_name, person)}
            showPicker={pickerOpen[field.property_name] || false}
            onShowPickerChange={(open) => setPickerOpen(prev => ({ ...prev, [field.property_name]: open }))}
            placeholder={`Select ${field.name}`}
            required={field.required}
          />
        )

      case 'location':
        return (
          <LocationPickerField
            key={field.id}
            label={field.name}
            value={pickerValues[field.property_name] as Location | null}
            onValueChange={(location) => updatePickerValue(field.property_name, location)}
            showPicker={pickerOpen[field.property_name] || false}
            onShowPickerChange={(open) => setPickerOpen(prev => ({ ...prev, [field.property_name]: open }))}
            placeholder={`Select ${field.name}`}
            required={field.required}
          />
        )

      case 'group':
        return (
          <GroupPickerField
            key={field.id}
            label={field.name}
            value={pickerValues[field.property_name] as Group | null}
            onValueChange={(group) => updatePickerValue(field.property_name, group)}
            showPicker={pickerOpen[field.property_name] || false}
            onShowPickerChange={(open) => setPickerOpen(prev => ({ ...prev, [field.property_name]: open }))}
            placeholder={`Select ${field.name}`}
            required={field.required}
          />
        )

      case 'calendar_event':
        return (
          <CalendarEventField
            key={field.id}
            label={field.name}
            value={fieldValues[`calendar_event_${field.id}`] || {}}
            onValueChange={(val) => updateCalendarEventValue(field.id, val)}
            required={field.required}
          />
        )

      case 'content':
        return (
          <ContentPickerField
            key={field.id}
            label={field.name}
            value={pickerValues[field.property_name] as ContentWithTags | null}
            onValueChange={(content) => updatePickerValue(field.property_name, content)}
            showPicker={pickerOpen[field.property_name] || false}
            onShowPickerChange={(open) => setPickerOpen(prev => ({ ...prev, [field.property_name]: open }))}
            placeholder={`Select ${field.name}`}
            required={field.required}
            defaultFilterTags={field.filter_tags || []}
          />
        )

      case 'petition':
        return (
          <PetitionPickerField
            key={field.id}
            label={field.name}
            value={pickerValues[field.property_name] as Petition | null}
            onValueChange={(petition) => updatePickerValue(field.property_name, petition)}
            showPicker={pickerOpen[field.property_name] || false}
            onShowPickerChange={(open) => setPickerOpen(prev => ({ ...prev, [field.property_name]: open }))}
            placeholder={`Select or create ${field.name}`}
            required={field.required}
            eventContext={{
              eventTypeName: eventType.name,
              occasionDate: new Date().toISOString().split('T')[0],
              language: 'en',
            }}
          />
        )

      case 'list_item':
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
            onValueChange={(itemId) => updateListItemValue(field.property_name, itemId)}
            placeholder={`Select ${field.name}`}
            required={field.required}
          />
        )

      case 'document':
        return (
          <DocumentPickerField
            key={field.id}
            label={field.name}
            value={typeof value === 'string' ? value : null}
            onValueChange={(documentId, doc) => {
              setPickerValues(prev => ({ ...prev, [field.property_name]: doc }))
              setFieldValues(prev => ({ ...prev, [field.property_name]: documentId }))
            }}
            placeholder={`Upload ${field.name}`}
            required={field.required}
          />
        )

      case 'date':
        return (
          <DatePickerField
            key={field.id}
            id={field.property_name}
            label={field.name}
            value={value ? new Date(value + 'T12:00:00') : undefined}
            onValueChange={(date) => updateFieldValue(field.property_name, date ? toLocalDateString(date) : '')}
            closeOnSelect
            required={field.required}
          />
        )

      case 'time':
        return (
          <TimePickerField
            key={field.id}
            id={field.property_name}
            label={field.name}
            value={typeof value === 'string' ? value : ''}
            onChange={(time) => updateFieldValue(field.property_name, time)}
            required={field.required}
          />
        )

      case 'number':
        return (
          <FormInput
            key={field.id}
            id={field.property_name}
            label={field.name}
            inputType="text"
            value={typeof value === 'string' ? value : ''}
            onChange={(val) => updateFieldValue(field.property_name, val)}
            placeholder={`Enter ${field.name.toLowerCase()}`}
            required={field.required}
          />
        )

      case 'yes_no':
        return (
          <div key={field.id} className="flex items-center justify-between py-2">
            <Label htmlFor={field.property_name} className="text-sm font-medium">
              {field.name}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Switch
              id={field.property_name}
              checked={!!value}
              onCheckedChange={(checked) => updateFieldValue(field.property_name, checked)}
            />
          </div>
        )

      case 'spacer':
        return <FormSpacer key={field.id} label={field.name} />

      case 'rich_text':
        return (
          <FormInput
            key={field.id}
            id={field.property_name}
            label={field.name}
            inputType="textarea"
            value={typeof value === 'string' ? value : ''}
            onChange={(val) => updateFieldValue(field.property_name, val)}
            rows={4}
            placeholder={`Enter ${field.name.toLowerCase()}...`}
            required={field.required}
          />
        )

      case 'text':
      default:
        return (
          <FormInput
            key={field.id}
            id={field.property_name}
            label={field.name}
            value={typeof value === 'string' ? value : ''}
            onChange={(val) => updateFieldValue(field.property_name, val)}
            placeholder={`Enter ${field.name.toLowerCase()}`}
            required={field.required}
          />
        )
    }
  }

  // Sort fields by order
  const sortedFields = [...(eventType.input_field_definitions || [])].sort((a, b) => a.order - b.order)

  // Get status label
  const getStatusLabel = (status: MasterEventStatus) => {
    const labels: Record<MasterEventStatus, string> = {
      PLANNING: 'Planning',
      ACTIVE: 'Active',
      SCHEDULED: 'Scheduled',
      COMPLETED: 'Completed',
      CANCELLED: 'Cancelled'
    }
    return labels[status]
  }

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      {/* Basic Information */}
      <FormSectionCard
        title="Basic Information"
        description={`Core details for this ${eventType.name}`}
      >
        <FormInput
          id="status"
          inputType="select"
          label="Status"
          description="Current status of this event"
          value={watch('status') || 'PLANNING'}
          onChange={(value) => setValue('status', value as MasterEventStatus)}
          options={MASTER_EVENT_STATUS_VALUES.map((value) => ({
            value,
            label: getStatusLabel(value)
          }))}
          error={errors.status?.message}
        />
      </FormSectionCard>

      {/* Dynamic Fields from Event Type */}
      {sortedFields.length > 0 && (
        <FormSectionCard
          title={`${eventType.name} Details`}
          description="Event-specific information"
        >
          <div className="space-y-4">
            {sortedFields.map(renderField)}
          </div>
        </FormSectionCard>
      )}

      {/* Ministers (Presider and Homilist) */}
      <FormSectionCard
        title="Ministers"
        description="People serving in key liturgical roles"
      >
        <PersonPickerField
          label="Presider"
          description="Priest or deacon presiding at this event"
          value={presider}
          onValueChange={setPresider}
          showPicker={presiderPickerOpen}
          onShowPickerChange={setPresiderPickerOpen}
          autoSetSex="MALE"
          additionalVisibleFields={['email', 'phone_number', 'note']}
        />

        <PersonPickerField
          label="Homilist"
          description="Person giving the homily (if different from presider)"
          value={homilist}
          onValueChange={setHomilist}
          showPicker={homilistPickerOpen}
          onShowPickerChange={setHomilstPickerOpen}
          autoSetSex="MALE"
          additionalVisibleFields={['email', 'phone_number', 'note']}
        />
      </FormSectionCard>

      {/* Form Actions */}
      <FormBottomActions
        isEditing={isEditing}
        isLoading={isSubmitting}
        cancelHref={isEditing && initialData ? `/masses/${initialData.id}` : '/masses'}
        moduleName={eventType.name}
      />
    </form>
  )
}
