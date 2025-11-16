"use client"

import { useState, useEffect, useMemo } from "react"
import { z } from "zod"
import { Label } from "@/components/ui/label"
import { FormField } from "@/components/ui/form-field"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { createBaptism, updateBaptism, type CreateBaptismData, type BaptismWithRelations } from "@/lib/actions/baptisms"
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
import { MODULE_STATUS_VALUES, MODULE_STATUS_LABELS, BAPTISM_TEMPLATE_VALUES, BAPTISM_TEMPLATE_LABELS, BAPTISM_DEFAULT_TEMPLATE } from "@/lib/constants"
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
  status: z.string().optional(),
  baptism_template_id: z.string().optional(),
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
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Notify parent component of loading state changes
  useEffect(() => {
    onLoadingChange?.(isLoading)
  }, [isLoading, onLoadingChange])

  // State for all fields
   
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE" | "ARCHIVED">(baptism?.status as any || "ACTIVE")
  const [note, setNote] = useState(baptism?.note || "")
  const [baptismTemplateId, setBaptismTemplateId] = useState(baptism?.baptism_template_id || BAPTISM_DEFAULT_TEMPLATE)

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
    setValidationErrors({})

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
        router.push(`/baptisms/${newBaptism.id}`)
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
      <Card>
        <CardHeader>
          <CardTitle>Key Information</CardTitle>
          <CardDescription>Essential details about the child and baptism event</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
      </Card>

      {/* Other People */}
      <Card>
        <CardHeader>
          <CardTitle>Other People</CardTitle>
          <CardDescription>Parents and godparents</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
      </Card>

      {/* Key Liturgical Roles */}
      <Card>
        <CardHeader>
          <CardTitle>Key Liturgical Roles</CardTitle>
          <CardDescription>Primary liturgical ministers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <PersonPickerField
            label="Presider"
            value={presider.value}
            onValueChange={presider.setValue}
            showPicker={presider.showPicker}
            onShowPickerChange={presider.setShowPicker}
            placeholder="Select Presider"
            openToNewPerson={!presider.value}
          />
        </CardContent>
      </Card>

      {/* Other Liturgical Roles and Liturgical Selections */}
      <Card>
        <CardHeader>
          <CardTitle>Other Liturgical Roles and Liturgical Selections</CardTitle>
          <CardDescription>Additional ministers and ceremony options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">No additional roles configured yet.</p>
        </CardContent>
      </Card>

      {/* Petitions (If applicable) */}
      <Card>
        <CardHeader>
          <CardTitle>Petitions</CardTitle>
          <CardDescription>Special intentions and prayers (if applicable)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">No petitions configured yet.</p>
        </CardContent>
      </Card>

      {/* Announcements (If applicable) */}
      <Card>
        <CardHeader>
          <CardTitle>Announcements</CardTitle>
          <CardDescription>Special announcements (if applicable)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">No announcements configured yet.</p>
        </CardContent>
      </Card>

      {/* Additional Details */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="baptism_template_id">Ceremony Template</Label>
            <Select value={baptismTemplateId} onValueChange={setBaptismTemplateId}>
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
            <Select value={status} onValueChange={(value) => setStatus(value as "ACTIVE" | "INACTIVE" | "ARCHIVED")}>
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
