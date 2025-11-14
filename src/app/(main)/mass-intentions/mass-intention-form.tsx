"use client"

import { useState, useEffect } from "react"
import { FormField } from "@/components/ui/form-field"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createMassIntention, updateMassIntention, type CreateMassIntentionData, type MassIntentionWithRelations } from "@/lib/actions/mass-intentions"
import type { Person } from "@/lib/types"
import { useRouter } from "next/navigation"
import { toast } from 'sonner'
import { SelectItem } from "@/components/ui/select"
import { PersonPickerField } from "@/components/person-picker-field"
import { MassPickerField } from "@/components/mass-picker-field"
import { MASS_INTENTION_STATUS_VALUES, MASS_INTENTION_STATUS_LABELS } from "@/lib/constants"
import { FormBottomActions } from "@/components/form-bottom-actions"
import { usePickerState } from "@/hooks/use-picker-state"
import { MassPicker } from "@/components/mass-picker"
import { Textarea } from "@/components/ui/textarea"
import type { MassWithNames } from "@/lib/actions/masses"

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

  // Picker states
  const requestedBy = usePickerState<Person>()
  const assignedMass = usePickerState<MassWithNames>()

  // Initialize form with intention data when editing
  useEffect(() => {
    if (intention) {
      if (intention.requested_by) requestedBy.setValue(intention.requested_by)
      if (intention.mass) assignedMass.setValue(intention.mass as any)
    }
  }, [intention])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate required field
      if (!massOfferedFor.trim()) {
        toast.error('Please enter what the Mass is offered for')
        setIsLoading(false)
        return
      }

      // Convert stipend from dollars to cents
      const stipendCents = stipendInCents ? Math.round(parseFloat(stipendInCents) * 100) : undefined

      const intentionData: CreateMassIntentionData = {
        mass_id: assignedMass.value?.id,
        mass_offered_for: massOfferedFor || undefined,
        requested_by_id: requestedBy.value?.id,
        date_requested: dateRequested || undefined,
        date_received: dateReceived || undefined,
        stipend_in_cents: stipendCents,
        status: status || undefined,
        note: note || undefined,
      }

      if (isEditing) {
        await updateMassIntention(intention.id, intentionData)
        toast.success('Mass intention updated successfully')
        router.refresh() // Refresh to get updated data
      } else {
        const newIntention = await createMassIntention(intentionData)
        toast.success('Mass intention created successfully')
        router.push(`/mass-intentions/${newIntention.id}`)
      }
    } catch (error) {
      console.error('Error saving Mass intention:', error)
      toast.error(isEditing ? 'Failed to update Mass intention' : 'Failed to create Mass intention')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Mass Intention Details</CardTitle>
          <CardDescription>
            Core information about this Mass intention
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
                {MASS_INTENTION_STATUS_LABELS[value].en}
              </SelectItem>
            ))}
          </FormField>
        </CardContent>
      </Card>

      {/* Dates and Financial Information */}
      <Card>
        <CardHeader>
          <CardTitle>Dates and Stipend</CardTitle>
          <CardDescription>
            When the intention was requested/received and stipend amount
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
          <CardDescription>
            Additional information or special requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add any additional notes or special requests..."
            rows={3}
          />
        </CardContent>
      </Card>

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
