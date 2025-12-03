"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormInput } from "@/components/form-input"
import { FormSectionCard } from "@/components/form-section-card"
import { createOciaSession, updateOciaSession, type OciaSessionWithRelations } from "@/lib/actions/ocia-sessions"
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
  createOciaSessionSchema,
  type CreateOciaSessionData
} from "@/lib/schemas/ocia-sessions"
import { CandidatesSection } from "./candidates-section"

interface OciaSessionFormProps {
  ociaSession?: OciaSessionWithRelations
  formId?: string
  onLoadingChange?: (loading: boolean) => void
}

export function OciaSessionForm({ ociaSession, formId, onLoadingChange }: OciaSessionFormProps) {
  const router = useRouter()
  const isEditing = !!ociaSession

  // Initialize React Hook Form with Zod validation
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<CreateOciaSessionData>({
    resolver: zodResolver(createOciaSessionSchema),
    defaultValues: {
      name: ociaSession?.name || "",
      status: (ociaSession?.status as ModuleStatus) || "ACTIVE",
      ocia_event_id: ociaSession?.ocia_event_id || null,
      coordinator_id: ociaSession?.coordinator_id || null,
      ocia_template_id: ociaSession?.ocia_template_id || null,
      note: ociaSession?.note || null,
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
  const ociaEvent = usePickerState<Event>()
  const coordinator = usePickerState<Person>()

  // Initialize picker states when editing
  useEffect(() => {
    if (ociaSession) {
      // Set event
      if (ociaSession.ocia_event) ociaEvent.setValue(ociaSession.ocia_event)

      // Set coordinator
      if (ociaSession.coordinator) coordinator.setValue(ociaSession.coordinator)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ociaSession])

  // Sync picker values to form when they change - Event
  useEffect(() => {
    setValue("ocia_event_id", ociaEvent.value?.id || null)
  }, [ociaEvent.value, setValue])

  // Sync picker values to form when they change - Coordinator
  useEffect(() => {
    setValue("coordinator_id", coordinator.value?.id || null)
  }, [coordinator.value, setValue])

  const onSubmit = async (data: CreateOciaSessionData) => {
    try {
      if (isEditing && ociaSession) {
        await updateOciaSession(ociaSession.id, data)
        toast.success('OCIA session updated successfully')
        router.refresh() // Stay on edit page to show updated data
      } else {
        const newOciaSession = await createOciaSession(data)
        toast.success('OCIA session created successfully')
        router.push(`/ocia-sessions/${newOciaSession.id}/edit`)
      }
    } catch (error) {
      console.error(`Failed to ${isEditing ? 'update' : 'create'} OCIA session:`, error)
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} OCIA session. Please try again.`)
    }
  }

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Session Information */}
      <FormSectionCard
        title="Session Information"
        description="Basic information about this OCIA session"
      >
        <FormInput
          id="name"
          label="Session Name"
          value={name}
          onChange={(value) => setValue("name", value)}
          error={errors.name?.message}
          required
          placeholder="e.g., 2025-2026 OCIA Session"
        />
        <EventPickerField
          label="OCIA Session Event"
          value={ociaEvent.value}
          onValueChange={ociaEvent.setValue}
          showPicker={ociaEvent.showPicker}
          onShowPickerChange={ociaEvent.setShowPicker}
          placeholder="Add OCIA Session Event"
          openToNewEvent={!ociaEvent.value}
          defaultRelatedEventType="OCIA"
          defaultName={name || "OCIA Session"}
          disableSearch={true}
        />
        <PersonPickerField
          label="Coordinator"
          value={coordinator.value}
          onValueChange={coordinator.setValue}
          showPicker={coordinator.showPicker}
          onShowPickerChange={coordinator.setShowPicker}
          placeholder="Select Coordinator"
          openToNewPerson={!coordinator.value}
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
          placeholder="Add any notes or special instructions for this OCIA session..."
          rows={12}
        />
      </FormSectionCard>

      {/* Candidates in Session Section */}
      {isEditing && ociaSession && (
        <CandidatesSection ociaSession={ociaSession} />
      )}

      {/* Bottom Actions */}
      <FormBottomActions
        isEditing={isEditing}
        isLoading={isSubmitting}
        cancelHref={isEditing && ociaSession ? `/ocia-sessions/${ociaSession.id}` : "/ocia-sessions"}
        moduleName="OCIA Session"
      />
    </form>
  )
}
