"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { FormField } from "@/components/ui/form-field"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { createBaptism, updateBaptism, createBaptismSchema, type CreateBaptismData, type BaptismWithRelations } from "@/lib/actions/baptisms"
import { useRouter } from "next/navigation"
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PersonPickerField } from "@/components/person-picker-field"
import { EventPickerField } from "@/components/event-picker-field"
import { MODULE_STATUS_VALUES, MODULE_STATUS_LABELS } from "@/lib/constants"
import { FormBottomActions } from "@/components/form-bottom-actions"
import { BAPTISM_TEMPLATES } from "@/lib/content-builders/baptism"
import { usePickerState } from "@/hooks/use-picker-state"
import type { Person, Event } from "@/lib/types"

interface BaptismFormProps {
  baptism?: BaptismWithRelations
  formId?: string
  onLoadingChange?: (loading: boolean) => void
}

export function BaptismForm({ baptism, formId, onLoadingChange }: BaptismFormProps) {
  const router = useRouter()
  const isEditing = !!baptism
  const [isLoading, setIsLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Notify parent component of loading state changes
  useEffect(() => {
    onLoadingChange?.(isLoading)
  }, [isLoading, onLoadingChange])

  // State for all fields
  const [status, setStatus] = useState(baptism?.status || "ACTIVE")
  const [note, setNote] = useState(baptism?.note || "")
  const [baptismTemplateId, setBaptismTemplateId] = useState(baptism?.baptism_template_id || "")

  // Picker states using usePickerState hook
  const baptismEvent = usePickerState<Event>()
  const child = usePickerState<Person>()
  const mother = usePickerState<Person>()
  const father = usePickerState<Person>()
  const sponsor1 = usePickerState<Person>()
  const sponsor2 = usePickerState<Person>()
  const presider = usePickerState<Person>()

  // Initialize form with baptism data when editing
  useEffect(() => {
    if (baptism) {
      // Set event
      if (baptism.baptism_event) baptismEvent.setValue(baptism.baptism_event)

      // Set people
      if (baptism.child) child.setValue(baptism.child)
      if (baptism.mother) mother.setValue(baptism.mother)
      if (baptism.father) father.setValue(baptism.father)
      if (baptism.sponsor_1) sponsor1.setValue(baptism.sponsor_1)
      if (baptism.sponsor_2) sponsor2.setValue(baptism.sponsor_2)
      if (baptism.presider) presider.setValue(baptism.presider)
    }
  }, [baptism])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setValidationErrors({})

    try {
      const formData: CreateBaptismData = {
        baptism_event_id: baptismEvent.value?.id,
        child_id: child.value?.id,
        mother_id: mother.value?.id,
        father_id: father.value?.id,
        sponsor_1_id: sponsor1.value?.id,
        sponsor_2_id: sponsor2.value?.id,
        presider_id: presider.value?.id,
        status,
        baptism_template_id: baptismTemplateId || undefined,
        note: note || undefined,
      }

      // Client-side validation (optional, for instant feedback)
      const result = createBaptismSchema.safeParse(formData)

      if (!result.success) {
        // Convert Zod errors to field errors
        const fieldErrors: Record<string, string> = {}
        result.error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message
          }
        })
        setValidationErrors(fieldErrors)
        toast.error('Please fix the validation errors')
        setIsLoading(false)
        return
      }

      if (isEditing && baptism) {
        await updateBaptism(baptism.id, result.data)
        toast.success('Baptism updated successfully')
        router.refresh()
      } else {
        const newBaptism = await createBaptism(result.data)
        toast.success('Baptism created successfully')
        router.push(`/baptisms/${newBaptism.id}`)
      }
    } catch (error) {
      console.error('Error saving baptism:', error)
      toast.error('Failed to save baptism. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} id={formId} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Baptism details and status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
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
          </div>

          {/* Template Selection */}
          <div className="space-y-2">
            <Label htmlFor="baptism_template_id">Template</Label>
            <Select value={baptismTemplateId} onValueChange={setBaptismTemplateId}>
              <SelectTrigger id="baptism_template_id">
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                {BAPTISM_TEMPLATES.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Baptism Event */}
          <EventPickerField
            label="Baptism Event"
            value={baptismEvent.value}
            onValueChange={baptismEvent.setValue}
            showPicker={baptismEvent.showPicker}
            onShowPickerChange={baptismEvent.setShowPicker}
            placeholder="Add Baptism Event"
            openToNewEvent={!isEditing}
            defaultEventType="BAPTISM"
            defaultName="Baptism"
            disableSearch={true}
          />
        </CardContent>
      </Card>

      {/* People Section */}
      <Card>
        <CardHeader>
          <CardTitle>People</CardTitle>
          <CardDescription>Child, parents, sponsors, and presider</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Child */}
          <PersonPickerField
            label="Child"
            value={child.value}
            onValueChange={child.setValue}
            showPicker={child.showPicker}
            onShowPickerChange={child.setShowPicker}
            placeholder="Select Child"
            openToNewPerson={!isEditing}
          />

          <Separator />

          {/* Mother */}
          <PersonPickerField
            label="Mother"
            value={mother.value}
            onValueChange={mother.setValue}
            showPicker={mother.showPicker}
            onShowPickerChange={mother.setShowPicker}
            placeholder="Select Mother"
            openToNewPerson={!isEditing}
          />

          {/* Father */}
          <PersonPickerField
            label="Father"
            value={father.value}
            onValueChange={father.setValue}
            showPicker={father.showPicker}
            onShowPickerChange={father.setShowPicker}
            placeholder="Select Father"
            openToNewPerson={!isEditing}
          />

          <Separator />

          {/* Sponsor 1 */}
          <PersonPickerField
            label="Sponsor 1 (Godparent)"
            value={sponsor1.value}
            onValueChange={sponsor1.setValue}
            showPicker={sponsor1.showPicker}
            onShowPickerChange={sponsor1.setShowPicker}
            placeholder="Select Sponsor 1"
            openToNewPerson={!isEditing}
          />

          {/* Sponsor 2 */}
          <PersonPickerField
            label="Sponsor 2 (Godparent)"
            value={sponsor2.value}
            onValueChange={sponsor2.setValue}
            showPicker={sponsor2.showPicker}
            onShowPickerChange={sponsor2.setShowPicker}
            placeholder="Select Sponsor 2"
            openToNewPerson={!isEditing}
          />

          <Separator />

          {/* Presider */}
          <PersonPickerField
            label="Presider"
            value={presider.value}
            onValueChange={presider.setValue}
            showPicker={presider.showPicker}
            onShowPickerChange={presider.setShowPicker}
            placeholder="Select Presider"
            openToNewPerson={!isEditing}
          />
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
          <CardDescription>Note and special instructions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Note */}
          <FormField
            id="note"
            label="Note"
            inputType="textarea"
            value={note}
            onChange={setNote}
            placeholder="Add any additional note or special instructions..."
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Form Actions */}
      <FormBottomActions
        isEditing={isEditing}
        cancelHref={isEditing && baptism ? `/baptisms/${baptism.id}` : "/baptisms"}
        isLoading={isLoading}
        saveLabel={isEditing ? "Save Changes" : "Create Baptism"}
      />
    </form>
  )
}
