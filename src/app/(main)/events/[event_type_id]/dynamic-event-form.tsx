"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { FormSectionCard } from "@/components/form-section-card"
import { createEvent, updateEvent } from "@/lib/actions/dynamic-events"
import type { DynamicEventWithRelations, DynamicEventTypeWithRelations } from "@/lib/types"
import { useRouter } from "next/navigation"
import { toast } from 'sonner'
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface DynamicEventFormProps {
  event?: DynamicEventWithRelations
  eventType: DynamicEventTypeWithRelations
  formId?: string
  onLoadingChange?: (loading: boolean) => void
}

export function DynamicEventForm({ event, eventType, formId, onLoadingChange }: DynamicEventFormProps) {
  const router = useRouter()
  const isEditing = !!event

  // Initialize React Hook Form
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      field_values: event?.field_values || {},
    },
  })

  // Notify parent component of loading state changes
  useEffect(() => {
    onLoadingChange?.(isSubmitting)
  }, [isSubmitting, onLoadingChange])

  // Handle form submission
  const onSubmit = async (data: any) => {
    try {
      if (isEditing) {
        // Update existing event
        await updateEvent(event.id, {
          field_values: data.field_values,
        })
        toast.success(`${eventType.name} updated successfully`)
        router.push(`/events/${eventType.id}/${event.id}`)
      } else {
        // Create new event
        const newEvent = await createEvent(eventType.id, {
          field_values: data.field_values,
        })
        toast.success(`${eventType.name} created successfully`)
        router.push(`/events/${eventType.id}/${newEvent.id}`)
      }
      router.refresh()
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} event:`, error)
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} ${eventType.name.toLowerCase()}`)
    }
  }

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Dynamic Fields Section */}
      <FormSectionCard title="Event Details">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Dynamic form fields will be rendered here based on input field definitions.
          </p>
          {/* TODO: Map input_field_definitions to form components */}
          {/* TODO: person → PersonPickerField */}
          {/* TODO: group → GroupPicker */}
          {/* TODO: location → LocationPickerField */}
          {/* TODO: event_link → EventPickerField (filtered) */}
          {/* TODO: list_item → Select from custom list */}
          {/* TODO: document → File upload (placeholder) */}
          {/* TODO: text → Input */}
          {/* TODO: rich_text → Textarea */}
          {/* TODO: date → DatePickerField */}
          {/* TODO: time → Time input */}
          {/* TODO: datetime → DatePickerField with time */}
          {/* TODO: number → Input type="number" */}
          {/* TODO: yes_no → Checkbox/Switch */}

          <div className="text-xs text-muted-foreground">
            <p className="font-medium mb-1">Input field definitions for this event type:</p>
            {eventType.input_field_definitions && eventType.input_field_definitions.length > 0 ? (
              <ul className="list-disc list-inside space-y-1">
                {eventType.input_field_definitions.map((field) => (
                  <li key={field.id}>
                    {field.name} ({field.type})
                    {field.required && ' - Required'}
                    {field.is_key_person && ' - Key Person'}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No input fields defined for this event type.</p>
            )}
          </div>
        </div>
      </FormSectionCard>

      {/* Occasions Section */}
      <FormSectionCard title="Occasions">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Occasions management will be implemented here.
          </p>
          {/* TODO: Add/edit/delete occasions */}
          {/* TODO: Mark primary occasion */}
          {/* TODO: Validate at least one occasion required */}
          {/* TODO: Validate exactly one occasion must be marked primary */}
        </div>
      </FormSectionCard>

      {/* Form bottom actions (Cancel button) */}
      <div className="flex justify-end">
        <Button type="button" variant="outline" asChild>
          <Link href={isEditing ? `/events/${eventType.id}/${event.id}` : `/events/${eventType.id}`}>
            Cancel
          </Link>
        </Button>
      </div>
    </form>
  )
}
