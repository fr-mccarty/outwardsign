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
import { createEvent, updateEvent } from "@/lib/actions/dynamic-events"
import type { DynamicEventWithRelations, DynamicEventTypeWithRelations, InputFieldDefinition, Person, Location, ContentWithTags } from "@/lib/types"
import { useRouter } from "next/navigation"
import { toast } from 'sonner'
import { FormBottomActions } from "@/components/form-bottom-actions"
import { toLocalDateString } from "@/lib/utils/formatters"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface DynamicEventFormProps {
  event?: DynamicEventWithRelations
  eventType: DynamicEventTypeWithRelations
  formId?: string
  onLoadingChange?: (loading: boolean) => void
}

interface FieldValues {
  [key: string]: string | boolean | null | undefined
}

interface OccasionData {
  label: string
  date: string
  time: string
  location_id?: string
  is_primary: boolean
}

export function DynamicEventForm({ event, eventType, formId, onLoadingChange }: DynamicEventFormProps) {
  const router = useRouter()
  const isEditing = !!event

  // State for field values
  const [fieldValues, setFieldValues] = useState<FieldValues>(() => {
    const initial: FieldValues = {}
    // Initialize from existing event or empty
    eventType.input_field_definitions?.forEach((field) => {
      initial[field.name] = event?.field_values?.[field.name] ?? (field.type === 'yes_no' ? false : '')
    })
    return initial
  })

  // State for picker values (person, location, content references)
  const [pickerValues, setPickerValues] = useState<Record<string, Person | Location | ContentWithTags | null>>(() => {
    const initial: Record<string, Person | Location | ContentWithTags | null> = {}
    // Initialize from resolved fields if editing
    if (event?.resolved_fields) {
      eventType.input_field_definitions?.forEach((field) => {
        if (field.type === 'person' || field.type === 'location' || field.type === 'content') {
          const resolved = event.resolved_fields?.[field.name]
          if (resolved?.resolved_value) {
            initial[field.name] = resolved.resolved_value as Person | Location | ContentWithTags
          }
        }
      })
    }
    return initial
  })

  // State for picker visibility
  const [pickerOpen, setPickerOpen] = useState<Record<string, boolean>>({})

  // State for primary occasion (simplified - just one occasion for now)
  const [occasion, setOccasion] = useState<OccasionData>(() => {
    const primaryOccasion = event?.occasions?.find(o => o.is_primary)
    return {
      label: primaryOccasion?.label || eventType.name,
      date: primaryOccasion?.date || '',
      time: primaryOccasion?.time || '',
      location_id: primaryOccasion?.location_id || undefined,
      is_primary: true
    }
  })
  const [occasionLocation, setOccasionLocation] = useState<Location | null>(
    event?.occasions?.find(o => o.is_primary)?.location || null
  )
  const [occasionLocationOpen, setOccasionLocationOpen] = useState(false)

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
  const updatePickerValue = (fieldName: string, value: Person | Location | ContentWithTags | null) => {
    setPickerValues(prev => ({ ...prev, [fieldName]: value }))
    setFieldValues(prev => ({ ...prev, [fieldName]: value?.id || null }))
  }

  // Handle form submission
  const onSubmit = async () => {
    // Validate required fields
    const missingRequired: string[] = []
    eventType.input_field_definitions?.forEach((field) => {
      if (field.required && !fieldValues[field.name]) {
        missingRequired.push(field.name)
      }
    })

    if (missingRequired.length > 0) {
      toast.error(`Please fill in required fields: ${missingRequired.join(', ')}`)
      return
    }

    // Validate occasion has a date
    if (!occasion.date) {
      toast.error('Please set a date for the event')
      return
    }

    try {
      if (isEditing) {
        await updateEvent(event.id, {
          field_values: fieldValues,
        })
        toast.success(`${eventType.name} updated successfully`)
        router.refresh() // Stay on edit page after update
      } else {
        const newEvent = await createEvent(eventType.id, {
          field_values: fieldValues,
          occasions: [{
            label: occasion.label || eventType.name,
            date: occasion.date,
            time: occasion.time || null,
            location_id: occasionLocation?.id || null,
            is_primary: true
          }]
        })
        toast.success(`${eventType.name} created successfully`)
        // Redirect to edit page after creation
        router.push(`/events/${eventType.slug}/${newEvent.id}/edit`)
      }
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} event:`, error)
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} ${eventType.name.toLowerCase()}`)
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

      {/* Occasion Section */}
      <FormSectionCard title="Date & Location">
        <div className="space-y-4">
          <DatePickerField
            id="occasion_date"
            label="Date"
            value={occasion.date ? new Date(occasion.date + 'T12:00:00') : undefined}
            onValueChange={(date) => setOccasion(prev => ({ ...prev, date: date ? toLocalDateString(date) : '' }))}
            required
            closeOnSelect
          />

          <TimePickerField
            id="occasion_time"
            label="Time"
            value={occasion.time}
            onChange={(time) => setOccasion(prev => ({ ...prev, time }))}
          />

          <LocationPickerField
            label="Location"
            value={occasionLocation}
            onValueChange={setOccasionLocation}
            showPicker={occasionLocationOpen}
            onShowPickerChange={setOccasionLocationOpen}
            placeholder="Select location"
          />
        </div>
      </FormSectionCard>

      <FormBottomActions
        isEditing={isEditing}
        isLoading={isSubmitting}
        cancelHref={isEditing ? `/events/${eventType.slug}/${event.id}` : `/events`}
        moduleName={eventType.name}
      />
    </form>
  )
}
