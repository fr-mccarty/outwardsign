'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PersonPickerField } from '@/components/person-picker-field'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ContentCard } from '@/components/content-card'
import { ConfirmationDialog } from '@/components/confirmation-dialog'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import {
  createPeopleEventAssignment,
  updatePeopleEventAssignment,
  deletePeopleEventAssignment,
  type PeopleEventAssignmentWithPerson,
} from '@/lib/actions/people-event-assignments'
import type { Person, InputFieldDefinition } from '@/lib/types'

interface PeopleEventAssignmentSectionProps {
  masterEventId: string
  eventTypeId: string
  currentAssignments: PeopleEventAssignmentWithPerson[]
  fieldDefinitions: InputFieldDefinition[] // Filter to type='person' && is_per_calendar_event=false
  onAssignmentChange?: () => void
}

/**
 * PeopleEventAssignmentSection - Manages template-level person assignments
 *
 * Template-level assignments have calendar_event_id = NULL and apply to all occurrences
 * of the master event (e.g., bride, groom, presider for weddings).
 *
 * Per requirements: Uses PersonPicker, server actions, and follows existing patterns.
 */
export function PeopleEventAssignmentSection({
  masterEventId,
  currentAssignments,
  fieldDefinitions,
  onAssignmentChange,
}: PeopleEventAssignmentSectionProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pickerStates, setPickerStates] = useState<Record<string, boolean>>({})
  const [notesStates, setNotesStates] = useState<Record<string, string>>({})
  const [removingAssignmentId, setRemovingAssignmentId] = useState<string | null>(null)

  // Find assignment for a field
  const findAssignment = (fieldDefId: string) => {
    return currentAssignments.find(a => a.field_definition_id === fieldDefId)
  }

  // Handle person selected for a field
  const handlePersonSelected = async (fieldDef: InputFieldDefinition, person: Person | null) => {
    if (!person) return

    setIsSubmitting(true)
    try {
      const existingAssignment = findAssignment(fieldDef.id)
      const notes = notesStates[fieldDef.id] || ''

      if (existingAssignment) {
        // Update existing assignment
        await updatePeopleEventAssignment(existingAssignment.id, {
          person_id: person.id,
          notes: notes || null,
        })
        toast.success(`${fieldDef.name} updated`)
      } else {
        // Create new assignment
        await createPeopleEventAssignment({
          master_event_id: masterEventId,
          calendar_event_id: null, // Template-level
          field_definition_id: fieldDef.id,
          person_id: person.id,
          notes: notes || null,
        })
        toast.success(`${fieldDef.name} assigned`)
      }

      // Close picker
      setPickerStates(prev => ({ ...prev, [fieldDef.id]: false }))

      // Refresh data
      router.refresh()
      onAssignmentChange?.()
    } catch (error) {
      console.error('Error assigning person:', error)
      toast.error(`Failed to assign ${fieldDef.name}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle remove assignment
  const handleRemoveAssignment = (assignmentId: string) => {
    setRemovingAssignmentId(assignmentId)
  }

  // Confirm remove assignment
  const confirmRemoveAssignment = async () => {
    if (!removingAssignmentId) return

    setIsSubmitting(true)
    try {
      await deletePeopleEventAssignment(removingAssignmentId)
      toast.success('Assignment removed')
      setRemovingAssignmentId(null)

      // Refresh data
      router.refresh()
      onAssignmentChange?.()
    } catch (error) {
      console.error('Error removing assignment:', error)
      toast.error('Failed to remove assignment')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle notes change
  const handleNotesChange = async (fieldDefId: string, notes: string) => {
    setNotesStates(prev => ({ ...prev, [fieldDefId]: notes }))

    // If assignment exists, update it
    const assignment = findAssignment(fieldDefId)
    if (assignment) {
      try {
        await updatePeopleEventAssignment(assignment.id, { notes: notes || null })
        router.refresh()
        onAssignmentChange?.()
      } catch (error) {
        console.error('Error updating notes:', error)
        toast.error('Failed to update notes')
      }
    }
  }

  if (fieldDefinitions.length === 0) {
    return (
      <ContentCard>
        <p className="text-sm text-muted-foreground text-center">
          No template-level person fields defined for this event type.
        </p>
      </ContentCard>
    )
  }

  return (
    <div className="space-y-4">
      {fieldDefinitions.map((field) => {
        const assignment = findAssignment(field.id)
        const assignedPerson = assignment?.person || null

        return (
          <div key={field.id} className="space-y-3">
            <PersonPickerField
              label={field.name}
              value={assignedPerson}
              onValueChange={(person) => handlePersonSelected(field, person)}
              showPicker={pickerStates[field.id] || false}
              onShowPickerChange={(open) => setPickerStates(prev => ({ ...prev, [field.id]: open }))}
              placeholder={`Select ${field.name}`}
              required={field.required}
            />

            {assignment && (
              <div className="ml-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`notes-${field.id}`} className="text-sm">
                    Notes (optional)
                  </Label>
                  {!field.required && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveAssignment(assignment.id)}
                      disabled={isSubmitting}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  )}
                </div>
                <Textarea
                  id={`notes-${field.id}`}
                  value={notesStates[field.id] || assignment.notes || ''}
                  onChange={(e) => handleNotesChange(field.id, e.target.value)}
                  placeholder="Add notes about this assignment..."
                  rows={2}
                  className="text-sm"
                  disabled={isSubmitting}
                />
              </div>
            )}
          </div>
        )
      })}

      {/* Remove Confirmation Dialog */}
      <ConfirmationDialog
        open={!!removingAssignmentId}
        onOpenChange={(open) => !open && setRemovingAssignmentId(null)}
        onConfirm={confirmRemoveAssignment}
        title="Remove Assignment?"
        description="Are you sure you want to remove this person from this role? This action cannot be undone."
        confirmLabel="Remove"
        cancelLabel="Cancel"
      />
    </div>
  )
}
