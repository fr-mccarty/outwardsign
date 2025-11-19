"use client"

import { useState, useEffect, useMemo } from "react"
import { z } from "zod"
import { Label } from "@/components/ui/label"
import { FormField } from "@/components/ui/form-field"
import { FormSectionCard } from "@/components/form-section-card"
import { Separator } from "@/components/ui/separator"
import { createBaptism, updateBaptism, type BaptismWithRelations } from "@/lib/actions/baptisms"
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
import { MODULE_STATUS_VALUES, BAPTISM_TEMPLATE_VALUES, BAPTISM_TEMPLATE_LABELS, BAPTISM_DEFAULT_TEMPLATE, type ModuleStatus, type BaptismTemplate } from "@/lib/constants"
import { getStatusLabel } from "@/lib/content-builders/shared/helpers"
import { FormBottomActions } from "@/components/form-bottom-actions"
import { usePickerState } from "@/hooks/use-picker-state"
import type { Person, Event } from "@/lib/types"

// Zod validation schema
const baptismSchema = z.object({
  baptism_event_id: z.string().optional(),
  child_id: z.string().optional(),
  mother_id: z.string().optional(),
  father_id: z.string().optional(),
  sponsor_1_id: z.string().optional(),
  sponsor_2_id: z.string().optional(),
  presider_id: z.string().optional(),
  status: z.enum(MODULE_STATUS_VALUES).optional(),
  baptism_template_id: z.enum(BAPTISM_TEMPLATE_VALUES).optional(),
  note: z.string().optional()
})

interface BaptismFormProps {
  baptism?: BaptismWithRelations
  formId?: string
  onLoadingChange?: (loading: boolean) => void
}

export function BaptismForm({ baptism, formId, onLoadingChange }: BaptismFormProps) {
  const router = useRouter()
  const isEditing = !!baptism
  const [isLoading, setIsLoading] = useState(false)

  // Notify parent component of loading state changes
  useEffect(() => {
    onLoadingChange?.(isLoading)
  }, [isLoading, onLoadingChange])

  // State for all fields

  const [status, setStatus] = useState<ModuleStatus>(baptism?.status || "ACTIVE")
  const [note, setNote] = useState(baptism?.note || "")
  const [baptismTemplateId, setBaptismTemplateId] = useState<BaptismTemplate>((baptism?.baptism_template_id as BaptismTemplate) || BAPTISM_DEFAULT_TEMPLATE)

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baptism])

  // Compute suggested event name based on child
  const suggestedBaptismName = useMemo(() => {
    const childFirstName = child.value?.first_name
    const childLastName = child.value?.last_name

    if (childFirstName && childLastName) {
      return `${childFirstName} ${childLastName} Baptism`
    } else if (childFirstName) {
      return `${childFirstName} Baptism`
    } else if (childLastName) {
      return `${childLastName} Baptism`
    }
    return "Baptism"
  }, [child.value])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate with Zod
      const formData = baptismSchema.parse({
        baptism_event_id: baptismEvent.value?.id,
        child_id: child.value?.id,
        mother_id: mother.value?.id,
        father_id: father.value?.id,
        sponsor_1_id: sponsor1.value?.id,
        sponsor_2_id: sponsor2.value?.id,
        presider_id: presider.value?.id,
        status: status || undefined,
        baptism_template_id: baptismTemplateId || undefined,
        note: note || undefined,
      })

      if (isEditing && baptism) {
        await updateBaptism(baptism.id, formData)
        toast.success('Baptism updated successfully')
        router.refresh() // Stay on edit page to show updated data
      } else {
        const newBaptism = await createBaptism(formData)
        toast.success('Baptism created successfully')
        router.push(`/baptisms/${newBaptism.id}/edit`)
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.issues[0].message)
      } else {
        console.error('Error saving baptism:', error)
        toast.error('Failed to save baptism. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} id={formId} className="space-y-8">
      {/* Key Information */}
      <FormSectionCard
        title="Key Information"
        description="Essential details about the child and baptism event"
      >
        <PersonPickerField
            label="Child"
            value={child.value}
            onValueChange={child.setValue}
            showPicker={child.showPicker}
            onShowPickerChange={child.setShowPicker}
            placeholder="Select Child"
            openToNewPerson={!child.value}
          />
          <EventPickerField
            label="Baptism Event"
            value={baptismEvent.value}
            onValueChange={baptismEvent.setValue}
            showPicker={baptismEvent.showPicker}
            onShowPickerChange={baptismEvent.setShowPicker}
            placeholder="Add Baptism Event"
            openToNewEvent={!baptismEvent.value}
            defaultEventType="BAPTISM"
            defaultName="Baptism"
            disableSearch={true}
            defaultCreateFormData={{ name: suggestedBaptismName }}
          />
      </FormSectionCard>

      {/* Other People */}
      <FormSectionCard
        title="Other People"
        description="Parents and godparents"
      >
        <div className="space-y-2">
            <Label className="text-base font-semibold">Parents</Label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PersonPickerField
              label="Mother"
              value={mother.value}
              onValueChange={mother.setValue}
              showPicker={mother.showPicker}
              onShowPickerChange={mother.setShowPicker}
              placeholder="Select Mother"
              openToNewPerson={!mother.value}
            />
            <PersonPickerField
              label="Father"
              value={father.value}
              onValueChange={father.setValue}
              showPicker={father.showPicker}
              onShowPickerChange={father.setShowPicker}
              placeholder="Select Father"
              openToNewPerson={!father.value}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label className="text-base font-semibold">Godparents</Label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PersonPickerField
              label="Godparent 1"
              value={sponsor1.value}
              onValueChange={sponsor1.setValue}
              showPicker={sponsor1.showPicker}
              onShowPickerChange={sponsor1.setShowPicker}
              placeholder="Select Godparent 1"
              openToNewPerson={!sponsor1.value}
            />
            <PersonPickerField
              label="Godparent 2"
              value={sponsor2.value}
              onValueChange={sponsor2.setValue}
              showPicker={sponsor2.showPicker}
              onShowPickerChange={sponsor2.setShowPicker}
              placeholder="Select Godparent 2"
              openToNewPerson={!sponsor2.value}
            />
          </div>
      </FormSectionCard>

      {/* Key Liturgical Roles */}
      <FormSectionCard
        title="Key Liturgical Roles"
        description="Primary liturgical ministers"
      >
        <PersonPickerField
            label="Presider"
            value={presider.value}
            onValueChange={presider.setValue}
            showPicker={presider.showPicker}
            onShowPickerChange={presider.setShowPicker}
            placeholder="Select Presider"
            autoSetSex="MALE"
          />
      </FormSectionCard>

      {/* Other Liturgical Roles and Liturgical Selections */}
      <FormSectionCard
        title="Other Liturgical Roles and Liturgical Selections"
        description="Additional ministers and ceremony options"
      >
        <p className="text-sm text-muted-foreground">No additional roles configured yet.</p>
      </FormSectionCard>

      {/* Petitions (If applicable) */}
      <FormSectionCard
        title="Petitions"
        description="Special intentions and prayers (if applicable)"
      >
        <p className="text-sm text-muted-foreground">No petitions configured yet.</p>
      </FormSectionCard>

      {/* Announcements (If applicable) */}
      <FormSectionCard
        title="Announcements"
        description="Special announcements (if applicable)"
      >
        <p className="text-sm text-muted-foreground">No announcements configured yet.</p>
      </FormSectionCard>

      {/* Additional Details */}
      <FormSectionCard
        title="Additional Details"
      >
        <div className="space-y-2">
            <Label htmlFor="baptism_template_id">Ceremony Template</Label>
            <Select value={baptismTemplateId} onValueChange={(value) => setBaptismTemplateId(value as BaptismTemplate)}>
              <SelectTrigger id="baptism_template_id">
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                {BAPTISM_TEMPLATE_VALUES.map((templateId) => (
                  <SelectItem key={templateId} value={templateId}>
                    {BAPTISM_TEMPLATE_LABELS[templateId].en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <FormField
            id="note"
            label="Notes (Optional)"
            inputType="textarea"
            value={note}
            onChange={setNote}
            placeholder="Add any additional note or special instructions..."
            rows={4}
            description="Additional information or special considerations"
          />

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as ModuleStatus)}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {MODULE_STATUS_VALUES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {getStatusLabel(s, 'en')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
      </FormSectionCard>

      {/* Form Actions */}
      <FormBottomActions
        isEditing={isEditing}
        cancelHref={isEditing && baptism ? `/baptisms/${baptism.id}` : "/baptisms"}
        isLoading={isLoading}
        moduleName="Baptism"
      />
    </form>
  )
}
