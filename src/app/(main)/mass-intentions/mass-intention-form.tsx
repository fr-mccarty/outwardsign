"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormInput } from "@/components/form-input"
import { FormSectionCard } from "@/components/form-section-card"
import { createMassIntention, updateMassIntention, type MassIntentionWithRelations } from "@/lib/actions/mass-intentions"
import { createMassIntentionSchema, type CreateMassIntentionData } from "@/lib/schemas/mass-intentions"
import type { Person } from "@/lib/types"
import { useRouter } from "next/navigation"
import { toast } from 'sonner'
import { SelectItem } from "@/components/ui/select"
import { PersonPickerField } from "@/components/person-picker-field"
import { MassPickerField } from "@/components/mass-picker-field"
import { MASS_INTENTION_STATUS_VALUES, MASS_INTENTION_TEMPLATE_VALUES, MASS_INTENTION_TEMPLATE_LABELS, MASS_INTENTION_DEFAULT_TEMPLATE, type MassIntentionStatus, type MassIntentionTemplate } from "@/lib/constants"
import { getStatusLabel } from "@/lib/content-builders/shared/helpers"
import { FormBottomActions } from "@/components/form-bottom-actions"
import { usePickerState } from "@/hooks/use-picker-state"
import { MassPicker } from "@/components/mass-picker"
import type { MassWithNames } from "@/lib/actions/masses"

interface MassIntentionFormProps {
  intention?: MassIntentionWithRelations
  formId?: string
  onLoadingChange?: (loading: boolean) => void
}

export function MassIntentionForm({ intention, formId, onLoadingChange }: MassIntentionFormProps) {
  const router = useRouter()
  const isEditing = !!intention

  // Initialize React Hook Form with Zod validation
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<CreateMassIntentionData>({
    resolver: zodResolver(createMassIntentionSchema),
    defaultValues: {
      mass_offered_for: intention?.mass_offered_for || "",
      status: intention?.status || "REQUESTED",
      date_requested: intention?.date_requested || null,
      date_received: intention?.date_received || null,
      stipend_in_cents: intention?.stipend_in_cents || null,
      note: intention?.note || null,
      requested_by_id: intention?.requested_by_id || null,
      mass_id: intention?.mass_id || null,
      mass_intention_template_id: (intention?.mass_intention_template_id as MassIntentionTemplate) || MASS_INTENTION_DEFAULT_TEMPLATE,
    },
  })

  // Notify parent component of loading state changes
  useEffect(() => {
    onLoadingChange?.(isSubmitting)
  }, [isSubmitting, onLoadingChange])

  // Watch form values
  const status = watch("status")
  const massOfferedFor = watch("mass_offered_for")
  const dateRequested = watch("date_requested")
  const dateReceived = watch("date_received")
  const stipendInCents = watch("stipend_in_cents")
  const note = watch("note")
  const massIntentionTemplateId = watch("mass_intention_template_id")

  // Picker states
  const requestedBy = usePickerState<Person>()
  const assignedMass = usePickerState<MassWithNames>()

  // Initialize form with intention data when editing
  useEffect(() => {
    if (intention) {
      if (intention.requested_by) requestedBy.setValue(intention.requested_by)
      if (intention.mass) assignedMass.setValue(intention.mass as any)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intention])

  // Sync picker values to form when they change
  useEffect(() => {
    setValue("requested_by_id", requestedBy.value?.id || null)
  }, [requestedBy.value, setValue])

  useEffect(() => {
    setValue("mass_id", assignedMass.value?.id || null)
  }, [assignedMass.value, setValue])

  const onSubmit = async (data: CreateMassIntentionData) => {
    try {
      if (isEditing && intention) {
        await updateMassIntention(intention.id, data)
        toast.success('Mass intention updated successfully')
        router.refresh() // Stay on edit page to show updated data
      } else {
        const newIntention = await createMassIntention(data)
        toast.success('Mass intention created successfully')
        router.push(`/mass-intentions/${newIntention.id}/edit`)
      }
    } catch (error) {
      console.error(`Failed to ${isEditing ? 'update' : 'create'} mass intention:`, error)
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} mass intention. Please try again.`)
    }
  }

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <FormSectionCard
        title="Mass Intention Details"
        description="Core information about this Mass intention"
      >
        <FormInput
            id="mass_offered_for"
            label="Mass Offered For"
            description="Who or what this Mass is being offered for (required)"
            value={massOfferedFor}
            onChange={(value) => setValue("mass_offered_for", value)}
            placeholder="In memory of John Smith"
            required
            error={errors.mass_offered_for?.message}
          />

          <PersonPickerField
            label="Requested By"
            description="Person who requested this Mass intention"
            value={requestedBy.value}
            onValueChange={requestedBy.setValue}
            showPicker={requestedBy.showPicker}
            onShowPickerChange={requestedBy.setShowPicker}
            openToNewPerson={!requestedBy.value}
            additionalVisibleFields={['email', 'phone_number', 'note']}
          />

          <MassPickerField
            label="Assigned Mass"
            description="Link this intention to a specific Mass (optional)"
            value={assignedMass.value}
            onValueChange={assignedMass.setValue}
            showPicker={assignedMass.showPicker}
            onShowPickerChange={assignedMass.setShowPicker}
          />

          <FormInput
            id="status"
            inputType="select"
            label="Status"
            description="Current status of this Mass intention"
            value={status || ""}
            onChange={(value) => setValue("status", value as MassIntentionStatus)}
            error={errors.status?.message}
          >
            {MASS_INTENTION_STATUS_VALUES.map((value) => (
              <SelectItem key={value} value={value}>
                {getStatusLabel(value, 'en')}
              </SelectItem>
            ))}
          </FormInput>

          <FormInput
            id="mass_intention_template_id"
            inputType="select"
            label="Print Template"
            description="Choose the template for printing this Mass intention"
            value={massIntentionTemplateId || ""}
            onChange={(value) => setValue("mass_intention_template_id", value as MassIntentionTemplate)}
            error={errors.mass_intention_template_id?.message}
          >
            {MASS_INTENTION_TEMPLATE_VALUES.map((value) => (
              <SelectItem key={value} value={value}>
                {MASS_INTENTION_TEMPLATE_LABELS[value].en}
              </SelectItem>
            ))}
          </FormInput>
      </FormSectionCard>

      {/* Dates and Financial Information */}
      <FormSectionCard
        title="Dates and Stipend"
        description="When the intention was requested/received and stipend amount"
      >
        <FormInput
            id="date_requested"
            inputType="date"
            label="Date Requested"
            description="When the parishioner requested this Mass intention"
            value={dateRequested || ""}
            onChange={(value) => setValue("date_requested", value || null)}
            error={errors.date_requested?.message}
          />

          <FormInput
            id="date_received"
            inputType="date"
            label="Date Received"
            description="When the parish office received this request"
            value={dateReceived || ""}
            onChange={(value) => setValue("date_received", value || null)}
            error={errors.date_received?.message}
          />

          <FormInput
            id="stipend_amount"
            inputType="number"
            label="Stipend Amount (cents)"
            description="Offering amount in cents (e.g., 1000 for $10.00)"
            value={stipendInCents?.toString() || ""}
            onChange={(value) => setValue("stipend_in_cents", value ? parseInt(value) : null)}
            placeholder="1000"
            step="1"
            min="0"
            error={errors.stipend_in_cents?.message}
          />
      </FormSectionCard>

      {/* Template and Notes */}
      <FormSectionCard
        title="Notes"
        description="Additional information about this Mass intention"
      >
        <FormInput
          id="note"
          label="Notes (Optional)"
          description="Additional information or special requests"
          inputType="textarea"
          value={note || ""}
          onChange={(value) => setValue("note", value || null)}
          placeholder="Add any additional notes or special requests..."
          rows={3}
          error={errors.note?.message}
        />
      </FormSectionCard>

      {/* Form Actions */}
      <FormBottomActions
        isEditing={isEditing}
        isLoading={isSubmitting}
        cancelHref={isEditing ? `/mass-intentions/${intention.id}` : '/mass-intentions'}
        moduleName="Mass Intention"
      />

      {/* Mass Picker Modal */}
      <MassPicker
        open={assignedMass.showPicker}
        onOpenChange={assignedMass.setShowPicker}
        onSelect={(selectedMass) => {
          assignedMass.setValue(selectedMass)
          assignedMass.setShowPicker(false)
        }}
        selectedMassId={assignedMass.value?.id}
      />
    </form>
  )
}
