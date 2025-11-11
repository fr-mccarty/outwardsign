"use client"

import { useState, useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormField } from "@/components/ui/form-field"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  createPresentation,
  updatePresentation,
  type PresentationWithRelations
} from "@/lib/actions/presentations"
import {
  createPresentationSchema,
  type CreatePresentationData
} from "@/lib/schemas/presentations"
import type { Person, Event } from "@/lib/types"
import { useRouter } from "next/navigation"
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MODULE_STATUS_VALUES, MODULE_STATUS_LABELS, EVENT_TYPE_LABELS, PRESENTATION_TEMPLATE_VALUES, PRESENTATION_TEMPLATE_LABELS } from "@/lib/constants"
import { FormBottomActions } from "@/components/form-bottom-actions"
import { usePickerState } from "@/hooks/use-picker-state"
import { PersonPickerField } from "@/components/person-picker-field"
import { EventPickerField } from "@/components/event-picker-field"

interface PresentationFormProps {
  presentation?: PresentationWithRelations
  formId?: string
  onLoadingChange?: (loading: boolean) => void
}

export function PresentationForm({ presentation, formId, onLoadingChange }: PresentationFormProps) {
  const router = useRouter()
  const isEditing = !!presentation

  // Initialize React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<CreatePresentationData>({
    resolver: zodResolver(createPresentationSchema),
    defaultValues: {
      presentation_event_id: presentation?.presentation_event_id || null,
      child_id: presentation?.child_id || null,
      mother_id: presentation?.mother_id || null,
      father_id: presentation?.father_id || null,
      coordinator_id: presentation?.coordinator_id || null,
      is_baptized: presentation?.is_baptized || false,
      status: (presentation?.status as "ACTIVE" | "INACTIVE" | "ARCHIVED") || "ACTIVE",
      note: presentation?.note || null,
      presentation_template_id: presentation?.presentation_template_id || "presentation-spanish",
    },
  })

  // Notify parent component of loading state changes
  useEffect(() => {
    onLoadingChange?.(isSubmitting)
  }, [isSubmitting, onLoadingChange])

  // Watch form values
  const isBaptized = watch("is_baptized")
  const status = watch("status")
  const presentationTemplateId = watch("presentation_template_id")

  // Picker states using usePickerState hook
  const presentationEvent = usePickerState<Event>()
  const child = usePickerState<Person>()
  const mother = usePickerState<Person>()
  const father = usePickerState<Person>()
  const coordinator = usePickerState<Person>()

  // Initialize picker states when editing
  useEffect(() => {
    if (presentation) {
      if (presentation.presentation_event) presentationEvent.setValue(presentation.presentation_event)
      if (presentation.child) child.setValue(presentation.child)
      if (presentation.mother) mother.setValue(presentation.mother)
      if (presentation.father) father.setValue(presentation.father)
      if (presentation.coordinator) coordinator.setValue(presentation.coordinator)
    }
  }, [presentation])

  // Sync picker values to form when they change
  useEffect(() => {
    setValue("presentation_event_id", presentationEvent.value?.id || null)
  }, [presentationEvent.value, setValue])

  useEffect(() => {
    setValue("child_id", child.value?.id || null)
  }, [child.value, setValue])

  useEffect(() => {
    setValue("mother_id", mother.value?.id || null)
  }, [mother.value, setValue])

  useEffect(() => {
    setValue("father_id", father.value?.id || null)
  }, [father.value, setValue])

  useEffect(() => {
    setValue("coordinator_id", coordinator.value?.id || null)
  }, [coordinator.value, setValue])

  // Compute suggested event name based on child
  const suggestedPresentationName = useMemo(() => {
    const childFirstName = child.value?.first_name
    const childLastName = child.value?.last_name

    if (childFirstName && childLastName) {
      return `${childFirstName} ${childLastName} Presentation`
    } else if (childFirstName) {
      return `${childFirstName} Presentation`
    } else if (childLastName) {
      return `${childLastName} Presentation`
    }
    return EVENT_TYPE_LABELS.PRESENTATION.en
  }, [child.value])

  const onSubmit = async (data: CreatePresentationData) => {
    try {
      if (isEditing) {
        await updatePresentation(presentation.id, data)
        toast.success('Presentation updated successfully')
        router.refresh()
      } else {
        const newPresentation = await createPresentation(data)
        toast.success('Presentation created successfully!')
        router.push(`/presentations/${newPresentation.id}`)
      }
    } catch (error) {
      console.error(`Failed to ${isEditing ? 'update' : 'create'} presentation:`, error)
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} presentation. Please try again.`)
    }
  }

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Event Information */}
      <Card>
        <CardHeader>
          <CardTitle>Event Information</CardTitle>
          <CardDescription>Schedule and location details for the presentation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <EventPickerField
            label="Presentation Event"
            value={presentationEvent.value}
            onValueChange={presentationEvent.setValue}
            showPicker={presentationEvent.showPicker}
            onShowPickerChange={presentationEvent.setShowPicker}
            placeholder="Select Presentation Event"
            openToNewEvent={!presentationEvent.value}
            defaultEventType="PRESENTATION"
            defaultName={EVENT_TYPE_LABELS.PRESENTATION.en}
            disableSearch={true}
            defaultCreateFormData={{ name: suggestedPresentationName }}
          />
        </CardContent>
      </Card>

      {/* People Information */}
      <Card>
        <CardHeader>
          <CardTitle>People</CardTitle>
          <CardDescription>Select the child and family members</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PersonPickerField
              label="Child"
              value={child.value}
              onValueChange={child.setValue}
              showPicker={child.showPicker}
              onShowPickerChange={child.setShowPicker}
              placeholder="Select Child"
              openToNewPerson={!isEditing}
              visibleFields={['email', 'phone_number', 'sex', 'note']}
            />
            <PersonPickerField
              label="Mother"
              value={mother.value}
              onValueChange={mother.setValue}
              showPicker={mother.showPicker}
              onShowPickerChange={mother.setShowPicker}
              placeholder="Select Mother"
              openToNewPerson={!isEditing}
              visibleFields={['email', 'phone_number', 'note']}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PersonPickerField
              label="Father"
              value={father.value}
              onValueChange={father.setValue}
              showPicker={father.showPicker}
              onShowPickerChange={father.setShowPicker}
              placeholder="Select Father"
              openToNewPerson={!isEditing}
              visibleFields={['email', 'phone_number', 'note']}
            />
            <PersonPickerField
              label="Coordinator (Optional)"
              value={coordinator.value}
              onValueChange={coordinator.setValue}
              showPicker={coordinator.showPicker}
              onShowPickerChange={coordinator.setShowPicker}
              placeholder="Select Coordinator"
              openToNewPerson={!isEditing}
              visibleFields={['email', 'phone_number', 'note']}
            />
          </div>
        </CardContent>
      </Card>

      {/* Additional Details */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={status || ""}
              onValueChange={(value) => setValue("status", value as any)}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {MODULE_STATUS_VALUES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {MODULE_STATUS_LABELS[s].en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-sm text-destructive">{errors.status.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="template">Ceremony Template</Label>
            <Select
              value={presentationTemplateId || ""}
              onValueChange={(value) => setValue("presentation_template_id", value)}
            >
              <SelectTrigger id="template">
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                {PRESENTATION_TEMPLATE_VALUES.map((templateId) => (
                  <SelectItem key={templateId} value={templateId}>
                    {PRESENTATION_TEMPLATE_LABELS[templateId].en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_baptized"
              checked={isBaptized || false}
              onCheckedChange={(checked) => setValue("is_baptized", checked as boolean)}
            />
            <label
              htmlFor="is_baptized"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Child is baptized
            </label>
          </div>

          <FormField
            id="note"
            label="Notes (Optional)"
            inputType="textarea"
            value={watch("note") || ""}
            onChange={(value) => setValue("note", value)}
            placeholder="Enter any additional notes..."
            rows={4}
            description="Additional information or special considerations"
          />
          {errors.note && (
            <p className="text-sm text-destructive">{errors.note.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Guidelines */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">Presentation Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Select the child who will be presented</li>
            <li>• Include both parents in the ceremony</li>
            <li>• Indicate whether the child has been baptized</li>
            <li>• Assign a coordinator to help manage the presentation</li>
            <li>• Add any special notes or considerations</li>
          </ul>
        </CardContent>
      </Card>

      {/* Form Buttons */}
      <FormBottomActions
        isEditing={isEditing}
        isLoading={isSubmitting}
        cancelHref={isEditing ? `/presentations/${presentation.id}` : '/presentations'}
        saveLabel={isEditing ? 'Update Presentation' : 'Save Presentation'}
      />
    </form>
  )
}
