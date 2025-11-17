"use client"

import { useState, useEffect } from "react"
import { z } from "zod"
import { FormField } from "@/components/ui/form-field"
import { FormSectionCard } from "@/components/form-section-card"
import { createMassIntention, updateMassIntention, type MassIntentionWithRelations } from "@/lib/actions/mass-intentions"
import type { Person } from "@/lib/types"
import { useRouter } from "next/navigation"
import { toast } from 'sonner'
import { SelectItem } from "@/components/ui/select"
import { PersonPickerField } from "@/components/person-picker-field"
import { MassPickerField } from "@/components/mass-picker-field"
import { MASS_INTENTION_STATUS_VALUES, MASS_INTENTION_TEMPLATE_VALUES, MASS_INTENTION_TEMPLATE_LABELS, MASS_INTENTION_DEFAULT_TEMPLATE } from "@/lib/constants"
import { getStatusLabel } from "@/lib/content-builders/shared/helpers"
import { FormBottomActions } from "@/components/form-bottom-actions"
import { usePickerState } from "@/hooks/use-picker-state"
import { MassPicker } from "@/components/mass-picker"
import { Textarea } from "@/components/ui/textarea"
import type { MassWithNames } from "@/lib/actions/masses"

// Zod validation schema
const massIntentionSchema = z.object({
  mass_offered_for: z.string().min(1, 'Please enter what the Mass is offered for'),
  status: z.string().optional(),
  date_requested: z.string().optional(),
  date_received: z.string().optional(),
  stipend_in_cents: z.number().optional(),
  note: z.string().optional(),
  requested_by_id: z.string().optional(),
  mass_id: z.string().optional(),
  mass_intention_template_id: z.string().optional()
})

interface MassIntentionFormProps {
  intention?: MassIntentionWithRelations
  formId?: string
  onLoadingChange?: (loading: boolean) => void
}

export function MassIntentionForm({ intention, formId, onLoadingChange }: MassIntentionFormProps) {
  const router = useRouter()
  const isEditing = !!intention
  const [isLoading, setIsLoading] = useState(false)

  // Notify parent component of loading state changes
  useEffect(() => {
    onLoadingChange?.(isLoading)
  }, [isLoading, onLoadingChange])

  // State for all fields
  const [status, setStatus] = useState(intention?.status || "REQUESTED")
  const [massOfferedFor, setMassOfferedFor] = useState(intention?.mass_offered_for || "")
  const [dateRequested, setDateRequested] = useState(intention?.date_requested || "")
  const [dateReceived, setDateReceived] = useState(intention?.date_received || "")
  const [stipendInCents, setStipendInCents] = useState<string>(
    intention?.stipend_in_cents ? (intention.stipend_in_cents / 100).toFixed(2) : ""
  )
  const [note, setNote] = useState(intention?.note || "")
  const [massIntentionTemplateId, setMassIntentionTemplateId] = useState(intention?.mass_intention_template_id || MASS_INTENTION_DEFAULT_TEMPLATE)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Convert stipend from dollars to cents
      const stipendCents = stipendInCents ? Math.round(parseFloat(stipendInCents) * 100) : undefined

      // Validate with Zod
      const intentionData = massIntentionSchema.parse({
        mass_id: assignedMass.value?.id,
        mass_offered_for: massOfferedFor || undefined,
        requested_by_id: requestedBy.value?.id,
        date_requested: dateRequested || undefined,
        date_received: dateReceived || undefined,
        stipend_in_cents: stipendCents,
        status: status || undefined,
        note: note || undefined,
        mass_intention_template_id: massIntentionTemplateId || undefined,
      })

      if (isEditing) {
        await updateMassIntention(intention.id, intentionData)
        toast.success('Mass intention updated successfully')
        router.refresh() // Refresh to get updated data
      } else {
        const newIntention = await createMassIntention(intentionData)
        toast.success('Mass intention created successfully')
        router.push(`/mass-intentions/${newIntention.id}/edit`)
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.issues[0].message)
      } else {
        console.error('Error saving Mass intention:', error)
        toast.error(isEditing ? 'Failed to update Mass intention' : 'Failed to create Mass intention')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <FormSectionCard
        title="Mass Intention Details"
        description="Core information about this Mass intention"
      >
        <FormField
            id="mass_offered_for"
            label="Mass Offered For"
            description="Who or what this Mass is being offered for (required)"
            value={massOfferedFor}
            onChange={setMassOfferedFor}
            placeholder="In memory of John Smith"
            required
          />

          <PersonPickerField
            label="Requested By"
            description="Person who requested this Mass intention"
            value={requestedBy.value}
            onValueChange={requestedBy.setValue}
            showPicker={requestedBy.showPicker}
            onShowPickerChange={requestedBy.setShowPicker}
            openToNewPerson={!requestedBy.value}
          />

          <MassPickerField
            label="Assigned Mass"
            description="Link this intention to a specific Mass (optional)"
            value={assignedMass.value}
            onValueChange={assignedMass.setValue}
            showPicker={assignedMass.showPicker}
            onShowPickerChange={assignedMass.setShowPicker}
          />

          <FormField
            id="status"
            inputType="select"
            label="Status"
            description="Current status of this Mass intention"
            value={status}
            onChange={setStatus}
          >
            {MASS_INTENTION_STATUS_VALUES.map((value) => (
              <SelectItem key={value} value={value}>
                {getStatusLabel(value, 'en')}
              </SelectItem>
            ))}
          </FormField>

          <FormField
            id="mass_intention_template_id"
            inputType="select"
            label="Print Template"
            description="Choose the template for printing this Mass intention"
            value={massIntentionTemplateId}
            onChange={setMassIntentionTemplateId}
          >
            {MASS_INTENTION_TEMPLATE_VALUES.map((value) => (
              <SelectItem key={value} value={value}>
                {MASS_INTENTION_TEMPLATE_LABELS[value].en}
              </SelectItem>
            ))}
          </FormField>
      </FormSectionCard>

      {/* Dates and Financial Information */}
      <FormSectionCard
        title="Dates and Stipend"
        description="When the intention was requested/received and stipend amount"
      >
        <FormField
            id="date_requested"
            inputType="date"
            label="Date Requested"
            description="When the parishioner requested this Mass intention"
            value={dateRequested}
            onChange={setDateRequested}
          />

          <FormField
            id="date_received"
            inputType="date"
            label="Date Received"
            description="When the parish office received this request"
            value={dateReceived}
            onChange={setDateReceived}
          />

          <FormField
            id="stipend_amount"
            inputType="number"
            label="Stipend Amount"
            description="Offering amount in dollars (e.g., 10.00)"
            value={stipendInCents}
            onChange={setStipendInCents}
            placeholder="10.00"
            step="0.01"
            min="0"
          />
      </FormSectionCard>

      {/* Notes */}
      <FormSectionCard
        title="Notes"
        description="Additional information or special requests"
      >
        <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add any additional notes or special requests..."
            rows={3}
          />
      </FormSectionCard>

      {/* Form Actions */}
      <FormBottomActions
        isEditing={isEditing}
        isLoading={isLoading}
        cancelHref={isEditing ? `/mass-intentions/${intention.id}` : '/mass-intentions'}
        saveLabel={isEditing ? "Save Mass Intention" : "Create Mass Intention"}
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
