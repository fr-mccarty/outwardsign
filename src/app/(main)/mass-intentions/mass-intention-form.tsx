"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormInput } from "@/components/form-input"
import { DatePickerField } from "@/components/date-picker-field"
import { toLocalDateString } from "@/lib/utils/formatters"
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
import type { MassWithNames } from "@/lib/schemas/masses"
import { useTranslations } from 'next-intl'

interface MassIntentionFormProps {
  intention?: MassIntentionWithRelations
  formId?: string
  onLoadingChange?: (loading: boolean) => void
}

export function MassIntentionForm({ intention, formId, onLoadingChange }: MassIntentionFormProps) {
  const router = useRouter()
  const isEditing = !!intention
  const t = useTranslations('massIntentions')

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
      master_event_id: intention?.master_event_id || null,
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
      if (intention.master_event) assignedMass.setValue(intention.master_event as any)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intention])

  // Sync picker values to form when they change
  useEffect(() => {
    setValue("requested_by_id", requestedBy.value?.id || null)
  }, [requestedBy.value, setValue])

  useEffect(() => {
    setValue("master_event_id", assignedMass.value?.id || null)
  }, [assignedMass.value, setValue])

  const onSubmit = async (data: CreateMassIntentionData) => {
    try {
      if (isEditing && intention) {
        await updateMassIntention(intention.id, data)
        toast.success(t('intentionUpdated'))
        router.refresh() // Stay on edit page to show updated data
      } else {
        const newIntention = await createMassIntention(data)
        toast.success(t('intentionCreated'))
        router.push(`/mass-intentions/${newIntention.id}/edit`)
      }
    } catch (error) {
      console.error(`Failed to ${isEditing ? 'update' : 'create'} mass intention:`, error)
      toast.error(isEditing ? t('errorUpdating') : t('errorCreating'))
    }
  }

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <FormSectionCard
        title={t('intentionDetails')}
        description={t('intentionDetailsDescription')}
      >
        <FormInput
            id="mass_offered_for"
            label={t('massOfferedFor')}
            description={t('massOfferedForDescription')}
            value={massOfferedFor}
            onChange={(value) => setValue("mass_offered_for", value)}
            placeholder={t('massOfferedForPlaceholder')}
            required
            error={errors.mass_offered_for?.message}
          />

          <PersonPickerField
            label={t('requestedByLabel')}
            description={t('requestedByDescription')}
            value={requestedBy.value}
            onValueChange={requestedBy.setValue}
            showPicker={requestedBy.showPicker}
            onShowPickerChange={requestedBy.setShowPicker}
            openToNewPerson={!requestedBy.value}
            additionalVisibleFields={['email', 'phone_number', 'note']}
          />

          <MassPickerField
            label={t('assignedMass')}
            description={t('assignedMassDescription')}
            value={assignedMass.value}
            onValueChange={assignedMass.setValue}
            showPicker={assignedMass.showPicker}
            onShowPickerChange={assignedMass.setShowPicker}
          />

          <FormInput
            id="status"
            inputType="select"
            label={t('statusLabel')}
            description={t('statusDescription')}
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
            label={t('printTemplate')}
            description={t('printTemplateDescription')}
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
        title={t('datesAndStipend')}
        description={t('datesAndStipendDescription')}
      >
        <DatePickerField
            id="date_requested"
            label={t('dateRequested')}
            description={t('dateRequestedDescription')}
            value={dateRequested ? new Date(dateRequested + 'T12:00:00') : undefined}
            onValueChange={(date) => setValue("date_requested", date ? toLocalDateString(date) : null)}
            error={errors.date_requested?.message}
            closeOnSelect
          />

          <DatePickerField
            id="date_received"
            label={t('dateReceived')}
            description={t('dateReceivedDescription')}
            value={dateReceived ? new Date(dateReceived + 'T12:00:00') : undefined}
            onValueChange={(date) => setValue("date_received", date ? toLocalDateString(date) : null)}
            error={errors.date_received?.message}
            closeOnSelect
          />

          <FormInput
            id="stipend_amount"
            inputType="number"
            label={t('stipendAmount')}
            description={t('stipendAmountDescription')}
            value={stipendInCents?.toString() || ""}
            onChange={(value) => setValue("stipend_in_cents", value ? parseInt(value) : null)}
            placeholder={t('stipendAmountPlaceholder')}
            step="1"
            min="0"
            error={errors.stipend_in_cents?.message}
          />
      </FormSectionCard>

      {/* Template and Notes */}
      <FormSectionCard
        title={t('notes')}
        description={t('notesDescription')}
      >
        <FormInput
          id="note"
          label={t('notesLabel')}
          description={t('notesLabelDescription')}
          inputType="textarea"
          value={note || ""}
          onChange={(value) => setValue("note", value || null)}
          placeholder={t('notesPlaceholder')}
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
