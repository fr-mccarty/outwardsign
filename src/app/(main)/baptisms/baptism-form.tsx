"use client"

import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Label } from "@/components/ui/label"
import { FormInput } from "@/components/form-input"
import { FormSectionCard } from "@/components/form-section-card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { createBaptism, updateBaptism, type BaptismWithRelations } from "@/lib/actions/baptisms"
import { useRouter } from "next/navigation"
import { toast } from 'sonner'
import Link from "next/link"
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
import {
  createBaptismSchema,
  type CreateBaptismData
} from "@/lib/schemas/baptisms"

interface BaptismFormProps {
  baptism?: BaptismWithRelations
  formId?: string
  onLoadingChange?: (loading: boolean) => void
}

export function BaptismForm({ baptism, formId, onLoadingChange }: BaptismFormProps) {
  const router = useRouter()
  const isEditing = !!baptism

  // Initialize React Hook Form with Zod validation
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<CreateBaptismData>({
    resolver: zodResolver(createBaptismSchema),
    defaultValues: {
      status: (baptism?.status as ModuleStatus) || "ACTIVE",
      baptism_event_id: baptism?.baptism_event_id || null,
      child_id: baptism?.child_id || null,
      mother_id: baptism?.mother_id || null,
      father_id: baptism?.father_id || null,
      sponsor_1_id: baptism?.sponsor_1_id || null,
      sponsor_2_id: baptism?.sponsor_2_id || null,
      presider_id: baptism?.presider_id || null,
      baptism_template_id: (baptism?.baptism_template_id as BaptismTemplate) || BAPTISM_DEFAULT_TEMPLATE,
      note: baptism?.note || null,
    },
  })

  // Notify parent component of loading state changes
  useEffect(() => {
    onLoadingChange?.(isSubmitting)
  }, [isSubmitting, onLoadingChange])

  // Watch form values
  const status = watch("status")
  const note = watch("note")
  const baptismTemplateId = watch("baptism_template_id")

  // Picker states using usePickerState hook
  const baptismEvent = usePickerState<Event>()
  const child = usePickerState<Person>()
  const mother = usePickerState<Person>()
  const father = usePickerState<Person>()
  const sponsor1 = usePickerState<Person>()
  const sponsor2 = usePickerState<Person>()
  const presider = usePickerState<Person>()

  // Initialize picker states when editing
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

  // Sync picker values to form when they change - Event
  useEffect(() => {
    setValue("baptism_event_id", baptismEvent.value?.id || null)
  }, [baptismEvent.value, setValue])

  // Sync picker values to form when they change - People
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
    setValue("sponsor_1_id", sponsor1.value?.id || null)
  }, [sponsor1.value, setValue])

  useEffect(() => {
    setValue("sponsor_2_id", sponsor2.value?.id || null)
  }, [sponsor2.value, setValue])

  useEffect(() => {
    setValue("presider_id", presider.value?.id || null)
  }, [presider.value, setValue])

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

  const onSubmit = async (data: CreateBaptismData) => {
    try {
      if (isEditing && baptism) {
        await updateBaptism(baptism.id, data)
        toast.success('Baptism updated successfully')
        router.refresh() // Stay on edit page to show updated data
      } else {
        const newBaptism = await createBaptism(data)
        toast.success('Baptism created successfully')
        router.push(`/baptisms/${newBaptism.id}/edit`)
      }
    } catch (error) {
      console.error(`Failed to ${isEditing ? 'update' : 'create'} baptism:`, error)
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} baptism. Please try again.`)
    }
  }

  // Check if baptism is part of a group
  const isPartOfGroup = baptism?.group_baptism_id != null

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Show group baptism link if part of a group */}
      {isPartOfGroup && baptism && (
        <div className="p-4 rounded-lg border-2 border-primary bg-primary/5">
          <div className="font-semibold text-lg text-primary mb-2">Part of Group Baptism</div>
          <p className="text-sm text-muted-foreground mb-3">
            This baptism is part of a group baptism ceremony. The event and presider are managed at the group level.
          </p>
          <Link
            href={`/group-baptisms/${baptism.group_baptism_id}`}
            className="inline-flex items-center text-sm font-medium text-primary hover:underline"
          >
            View Group Baptism
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><path d="m9 18 6-6-6-6"/></svg>
          </Link>
        </div>
      )}

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
            additionalVisibleFields={['email', 'phone_number', 'sex', 'note']}
          />
          {/* Only show event picker if NOT part of a group */}
          {!isPartOfGroup && (
            <EventPickerField
              label="Baptism Event"
              value={baptismEvent.value}
              onValueChange={baptismEvent.setValue}
              showPicker={baptismEvent.showPicker}
              onShowPickerChange={baptismEvent.setShowPicker}
              placeholder="Add Baptism Event"
              openToNewEvent={!baptismEvent.value}
              defaultRelatedEventType="BAPTISM"
              defaultName="Baptism"
              disableSearch={true}
              defaultCreateFormData={{ name: suggestedBaptismName }}
            />
          )}
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
              autoSetSex="FEMALE"
              additionalVisibleFields={['email', 'phone_number', 'note']}
            />
            <PersonPickerField
              label="Father"
              value={father.value}
              onValueChange={father.setValue}
              showPicker={father.showPicker}
              onShowPickerChange={father.setShowPicker}
              placeholder="Select Father"
              openToNewPerson={!father.value}
              autoSetSex="MALE"
              additionalVisibleFields={['email', 'phone_number', 'note']}
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
              additionalVisibleFields={['email', 'phone_number', 'note']}
            />
            <PersonPickerField
              label="Godparent 2"
              value={sponsor2.value}
              onValueChange={sponsor2.setValue}
              showPicker={sponsor2.showPicker}
              onShowPickerChange={sponsor2.setShowPicker}
              placeholder="Select Godparent 2"
              openToNewPerson={!sponsor2.value}
              additionalVisibleFields={['email', 'phone_number', 'note']}
            />
          </div>
      </FormSectionCard>

      {/* Key Liturgical Roles - Only show if NOT part of a group */}
      {!isPartOfGroup && (
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
              additionalVisibleFields={['email', 'phone_number', 'note']}
            />
        </FormSectionCard>
      )}

      {/* Additional Details */}
      <FormSectionCard
        title="Additional Details"
      >
        <div className="space-y-2">
            <Label htmlFor="baptism_template_id">Ceremony Template</Label>
            <Select
              value={baptismTemplateId || ""}
              onValueChange={(value) => setValue("baptism_template_id", value as BaptismTemplate)}
            >
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

          <FormInput
            id="note"
            label="Notes (Optional)"
            inputType="textarea"
            value={note || ""}
            onChange={(value) => setValue("note", value)}
            placeholder="Add any additional note or special instructions..."
            rows={4}
            description="Additional information or special considerations"
            error={errors.note?.message}
          />

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={status || ""}
              onValueChange={(value) => setValue("status", value as ModuleStatus)}
            >
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
        isLoading={isSubmitting}
        moduleName="Baptism"
      />
    </form>
  )
}
