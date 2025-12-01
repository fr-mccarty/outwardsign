"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormInput } from "@/components/form-input"
import { FormSectionCard } from "@/components/form-section-card"
import { createGroupBaptism, updateGroupBaptism, type GroupBaptismWithRelations } from "@/lib/actions/group-baptisms"
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
import { MODULE_STATUS_VALUES, type ModuleStatus } from "@/lib/constants"
import { getStatusLabel } from "@/lib/content-builders/shared/helpers"
import { FormBottomActions } from "@/components/form-bottom-actions"
import { usePickerState } from "@/hooks/use-picker-state"
import type { Person, Event } from "@/lib/types"
import {
  createGroupBaptismSchema,
  type CreateGroupBaptismData
} from "@/lib/schemas/group-baptisms"

interface GroupBaptismFormProps {
  groupBaptism?: GroupBaptismWithRelations
  formId?: string
  onLoadingChange?: (loading: boolean) => void
}

export function GroupBaptismForm({ groupBaptism, formId, onLoadingChange }: GroupBaptismFormProps) {
  const router = useRouter()
  const isEditing = !!groupBaptism

  // Initialize React Hook Form with Zod validation
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<CreateGroupBaptismData>({
    resolver: zodResolver(createGroupBaptismSchema),
    defaultValues: {
      name: groupBaptism?.name || "",
      status: (groupBaptism?.status as ModuleStatus) || "ACTIVE",
      group_baptism_event_id: groupBaptism?.group_baptism_event_id || null,
      presider_id: groupBaptism?.presider_id || null,
      group_baptism_template_id: groupBaptism?.group_baptism_template_id || null,
      note: groupBaptism?.note || null,
    },
  })

  // Notify parent component of loading state changes
  useEffect(() => {
    onLoadingChange?.(isSubmitting)
  }, [isSubmitting, onLoadingChange])

  // Watch form values
  const status = watch("status")
  const note = watch("note")
  const name = watch("name")

  // Picker states using usePickerState hook
  const groupBaptismEvent = usePickerState<Event>()
  const presider = usePickerState<Person>()

  // Initialize picker states when editing
  useEffect(() => {
    if (groupBaptism) {
      // Set event
      if (groupBaptism.group_baptism_event) groupBaptismEvent.setValue(groupBaptism.group_baptism_event)

      // Set people
      if (groupBaptism.presider) presider.setValue(groupBaptism.presider)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupBaptism])

  // Sync picker values to form when they change - Event
  useEffect(() => {
    setValue("group_baptism_event_id", groupBaptismEvent.value?.id || null)
  }, [groupBaptismEvent.value, setValue])

  // Sync picker values to form when they change - People
  useEffect(() => {
    setValue("presider_id", presider.value?.id || null)
  }, [presider.value, setValue])

  const onSubmit = async (data: CreateGroupBaptismData) => {
    try {
      if (isEditing && groupBaptism) {
        await updateGroupBaptism(groupBaptism.id, data)
        toast.success('Group baptism updated successfully')
        router.refresh() // Stay on edit page to show updated data
      } else {
        const newGroupBaptism = await createGroupBaptism(data)
        toast.success('Group baptism created successfully')
        router.push(`/group-baptisms/${newGroupBaptism.id}/edit`)
      }
    } catch (error) {
      console.error(`Failed to ${isEditing ? 'update' : 'create'} group baptism:`, error)
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} group baptism. Please try again.`)
    }
  }

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Group Information */}
      <FormSectionCard
        title="Group Information"
        description="Basic information about this group baptism ceremony"
      >
        <FormInput
          id="name"
          label="Group Name"
          value={name}
          onChange={(value) => setValue("name", value)}
          error={errors.name?.message}
          required
          placeholder="e.g., November 2025 Group Baptism"
        />
        <EventPickerField
          label="Group Baptism Event"
          value={groupBaptismEvent.value}
          onValueChange={groupBaptismEvent.setValue}
          showPicker={groupBaptismEvent.showPicker}
          onShowPickerChange={groupBaptismEvent.setShowPicker}
          placeholder="Add Group Baptism Event"
          openToNewEvent={!groupBaptismEvent.value}
          defaultRelatedEventType="BAPTISM"
          defaultName={name || "Group Baptism"}
          disableSearch={true}
        />
        <PersonPickerField
          label="Presider"
          value={presider.value}
          onValueChange={presider.setValue}
          showPicker={presider.showPicker}
          onShowPickerChange={presider.setShowPicker}
          placeholder="Select Presider"
          openToNewPerson={!presider.value}
          additionalVisibleFields={['email', 'phone_number', 'note']}
        />
      </FormSectionCard>

      {/* Status and Notes */}
      <FormSectionCard
        title="Status and Notes"
        description="Current status and additional information"
      >
        <div className="space-y-2">
          <label htmlFor="status" className="text-sm font-medium">
            Status
          </label>
          <Select
            value={status}
            onValueChange={(value: ModuleStatus) => setValue("status", value)}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              {MODULE_STATUS_VALUES.map((value) => (
                <SelectItem key={value} value={value}>
                  {getStatusLabel(value, 'en')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <FormInput
          id="note"
          label="Notes"
          inputType="textarea"
          value={note || ''}
          onChange={(value) => setValue("note", value || null)}
          error={errors.note?.message}
          placeholder="Add any notes or special instructions for this group baptism..."
          rows={12}
        />
      </FormSectionCard>

      {/* Baptisms in Group Section - Will be added in Phase 4 */}
      {isEditing && groupBaptism && (
        <FormSectionCard
          title={`Baptisms in This Group (${groupBaptism.baptisms?.length || 0})`}
          description="Manage the individual baptisms that are part of this group ceremony"
        >
          <div className="text-sm text-muted-foreground">
            <p>Baptism management components will be added in Phase 4.</p>
            <p className="mt-2">Current baptisms in this group: {groupBaptism.baptisms?.length || 0}</p>
          </div>
        </FormSectionCard>
      )}

      {/* Bottom Actions */}
      <FormBottomActions
        isEditing={isEditing}
        isLoading={isSubmitting}
        cancelHref={isEditing && groupBaptism ? `/group-baptisms/${groupBaptism.id}` : "/group-baptisms"}
        moduleName="Group Baptism"
      />
    </form>
  )
}
