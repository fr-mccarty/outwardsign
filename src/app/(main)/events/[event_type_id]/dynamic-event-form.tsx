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
import { OccasionFieldView, type OccasionFieldData } from "@/components/occasion-field-view"
import { createEvent, updateEvent } from "@/lib/actions/dynamic-events"
import type { DynamicEventWithRelations, DynamicEventTypeWithRelations, InputFieldDefinition, Person, Location, ContentWithTags, Petition } from "@/lib/types"
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

export function DynamicEventForm({ event, eventType, formId, onLoadingChange }: DynamicEventFormProps) {
  const router = useRouter()
  const isEditing = !!event

  // Get occasion fields from input definitions
  const occasionFields = (eventType.input_field_definitions || []).filter(f => f.type === 'occasion')

  // State for field values (non-occasion fields)
  const [fieldValues, setFieldValues] = useState<FieldValues>(() => {
    const initial: FieldValues = {}
    // Initialize from existing event or empty (skip occasion fields)
    eventType.input_field_definitions?.forEach((field) => {
      if (field.type !== 'occasion') {
        initial[field.name] = event?.field_values?.[field.name] ?? (field.type === 'yes_no' ? false : '')
      }
    })
    return initial
  })

  // State for occasion field values (keyed by field name)
  const [occasionValues, setOccasionValues] = useState<Record<string, OccasionFieldData>>(() => {
    const initial: Record<string, OccasionFieldData> = {}
    // Initialize occasion fields from existing occasions
    occasionFields.forEach((field) => {
      // Match occasion to field by label (field name = occasion label)
      const existingOccasion = event?.occasions?.find(occ => occ.label === field.name)
      initial[field.name] = {
        date: existingOccasion?.date || '',
        time: existingOccasion?.time || '',
        location_id: existingOccasion?.location_id || null,
        location: existingOccasion?.location || null
      }
    })
    return initial
  })

  // State for picker values (person, location, content, petition references)
  const [pickerValues, setPickerValues] = useState<Record<string, Person | Location | ContentWithTags | Petition | null>>(() => {
    const initial: Record<string, Person | Location | ContentWithTags | Petition | null> = {}
    // Initialize from resolved fields if editing
    if (event?.resolved_fields) {
      eventType.input_field_definitions?.forEach((field) => {
        if (field.type === 'person' || field.type === 'location' || field.type === 'content' || field.type === 'petition') {
          const resolved = event.resolved_fields?.[field.name]
          if (resolved?.resolved_value) {
            initial[field.name] = resolved.resolved_value as Person | Location | ContentWithTags | Petition
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
  const updatePickerValue = (fieldName: string, value: Person | Location | ContentWithTags | Petition | null) => {
    setPickerValues(prev => ({ ...prev, [fieldName]: value }))
    setFieldValues(prev => ({ ...prev, [fieldName]: value?.id || null }))
  }

  // Update occasion field value
  const updateOccasionValue = (fieldName: string, value: OccasionFieldData) => {
    setOccasionValues(prev => ({
      ...prev,
      [fieldName]: value
    }))
  }

  // Handle form submission
  const onSubmit = async () => {
    // Validate required fields (non-occasion fields)
    const missingRequired: string[] = []
    eventType.input_field_definitions?.forEach((field) => {
      if (field.type !== 'occasion' && field.required && !fieldValues[field.name]) {
        missingRequired.push(field.name)
      }
    })

    // Validate required occasion fields (must have at least a date)
    occasionFields.forEach((field) => {
      if (field.required && !occasionValues[field.name]?.date) {
        missingRequired.push(`${field.name} (Date)`)
      }
    })

    if (missingRequired.length > 0) {
      toast.error(`Please fill in required fields: ${missingRequired.join(', ')}`)
      return
    }

    // Build occasions array from occasion field values
    const occasions = occasionFields.map((field) => ({
      label: field.name,
      date: occasionValues[field.name]?.date || new Date().toISOString().split('T')[0],
      time: occasionValues[field.name]?.time || null,
      location_id: occasionValues[field.name]?.location_id || null,
      is_primary: field.is_primary
    }))

    // Ensure at least one occasion exists (use event type name as default if no occasion fields)
    if (occasions.length === 0) {
      occasions.push({
        label: eventType.name,
        date: new Date().toISOString().split('T')[0],
        time: null,
        location_id: null,
        is_primary: true
      })
    }

    if (!isEditing) {
      // Create event with occasions from occasion fields
      try {
        const newEvent = await createEvent(eventType.id, {
          field_values: fieldValues,
          occasions
        })
        toast.success(`${eventType.name} created successfully`)
        router.push(`/events/${eventType.slug}/${newEvent.id}`)
      } catch (error) {
        console.error('Error creating event:', error)
        toast.error(`Failed to create ${eventType.name.toLowerCase()}`)
      }
    } else {
      // Update event with field values and occasions
      try {
        await updateEvent(event.id, {
          field_values: fieldValues,
          occasions
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
              occasionDate: Object.values(occasionValues)[0]?.date || new Date().toISOString().split('T')[0],
              language: 'en', // TODO: Detect from event or use parish default
            }}
          />
        )

      case 'occasion':
        // Occasion inputs render date, time, and location together
        // In edit mode, show display view with modal for separate save
        const existingOccasion = event?.occasions?.find(occ => occ.label === field.name)
        return (
          <OccasionFieldView
            key={field.id}
            label={field.name}
            value={occasionValues[field.name] || { date: '', time: '', location_id: null, location: null }}
            onValueChange={(value) => updateOccasionValue(field.name, value)}
            required={field.required}
            isPrimary={field.is_primary}
            occasionId={existingOccasion?.id}
            eventId={event?.id}
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
