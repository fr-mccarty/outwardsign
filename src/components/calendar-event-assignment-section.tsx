'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PersonPickerField } from '@/components/person-picker-field'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ContentCard } from '@/components/content-card'
import { ConfirmationDialog } from '@/components/confirmation-dialog'
import { Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import {
  createPeopleEventAssignment,
  deletePeopleEventAssignment,
  type PeopleEventAssignmentWithPerson,
} from '@/lib/actions/people-event-assignments'
import type { Person, InputFieldDefinition } from '@/lib/types'

interface CalendarEventAssignmentSectionProps {
  masterEventId: string
  calendarEventId: string
  calendarEventDateTime: string
  eventTypeId: string
  currentAssignments: PeopleEventAssignmentWithPerson[]
  fieldDefinitions: InputFieldDefinition[] // Filter to type='person' && is_per_calendar_event=true
  roleQuantities?: Record<string, number> // From mass_times_template_items
  onAssignmentChange?: () => void
}

/**
 * CalendarEventAssignmentSection - Manages occurrence-level person assignments
 *
 * Occurrence-level assignments have calendar_event_id populated and apply to a specific
 * calendar event (e.g., lector for Saturday 5pm Mass, eucharistic minister for Sunday 10am).
 *
 * Per requirements: Shows count (X needed, Y assigned), add/remove buttons, PersonPicker dialog.
 */
export function CalendarEventAssignmentSection({
  masterEventId,
  calendarEventId,
  calendarEventDateTime,
  currentAssignments,
  fieldDefinitions,
  roleQuantities = {},
  onAssignmentChange,
}: CalendarEventAssignmentSectionProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activePickerFieldId, setActivePickerFieldId] = useState<string | null>(null)
  const [showPicker, setShowPicker] = useState(false)
  const [removingAssignmentId, setRemovingAssignmentId] = useState<string | null>(null)

  // Get assignments for a specific field
  const getFieldAssignments = (fieldDefId: string) => {
    return currentAssignments.filter(a => a.field_definition_id === fieldDefId)
  }

  // Get quantity needed for a field
  const getQuantityNeeded = (field: InputFieldDefinition): number => {
    return roleQuantities[field.property_name] || 1
  }

  // Handle opening picker for a field
  const handleOpenPicker = (fieldDefId: string) => {
    setActivePickerFieldId(fieldDefId)
    setShowPicker(true)
  }

  // Handle person selected
  const handlePersonSelected = async (person: Person | null) => {
    if (!person || !activePickerFieldId) return

    setIsSubmitting(true)
    try {
      await createPeopleEventAssignment({
        master_event_id: masterEventId,
        calendar_event_id: calendarEventId, // Occurrence-level
        field_definition_id: activePickerFieldId,
        person_id: person.id,
      })

      const fieldName = fieldDefinitions.find(f => f.id === activePickerFieldId)?.name || 'Role'
      toast.success(`${person.full_name} assigned to ${fieldName}`)

      // Close picker
      setShowPicker(false)
      setActivePickerFieldId(null)

      // Refresh data
      router.refresh()
      onAssignmentChange?.()
    } catch (error) {
      console.error('Error assigning person:', error)
      toast.error('Failed to assign person')
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

  if (fieldDefinitions.length === 0) {
    return (
      <ContentCard>
        <p className="text-sm text-muted-foreground text-center">
          No occurrence-level person fields defined for this event type.
        </p>
      </ContentCard>
    )
  }

  const activeField = activePickerFieldId
    ? fieldDefinitions.find(f => f.id === activePickerFieldId)
    : null

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground mb-2">
        {new Date(calendarEventDateTime).toLocaleString()}
      </div>

      {fieldDefinitions.map((field) => {
        const assignments = getFieldAssignments(field.id)
        const needed = getQuantityNeeded(field)
        const assigned = assignments.length
        const canAdd = assigned < needed

        return (
          <div key={field.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium">{field.name}</span>
                <Badge variant={assigned >= needed ? 'default' : 'secondary'}>
                  {assigned} / {needed}
                </Badge>
              </div>

              {canAdd && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenPicker(field.id)}
                  disabled={isSubmitting}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              )}
            </div>

            {/* List of assigned people */}
            {assignments.length > 0 && (
              <div className="space-y-2 ml-4">
                {assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-2 bg-accent/50 rounded-md"
                  >
                    <span className="text-sm font-medium">
                      {assignment.person.full_name}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveAssignment(assignment.id)}
                      disabled={isSubmitting}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {assignments.length === 0 && (
              <div className="text-sm text-muted-foreground ml-4">
                No one assigned yet
              </div>
            )}
          </div>
        )
      })}

      {/* Person Picker Dialog */}
      {activeField && (
        <PersonPickerField
          label={`Add ${activeField.name}`}
          value={null}
          onValueChange={handlePersonSelected}
          showPicker={showPicker}
          onShowPickerChange={setShowPicker}
          placeholder={`Select person for ${activeField.name}`}
          openToNewPerson={false}
          suggestedGroupIds={activeField.input_filter_tags || undefined}
        />
      )}

      {/* Remove Confirmation Dialog */}
      <ConfirmationDialog
        open={!!removingAssignmentId}
        onOpenChange={(open) => !open && setRemovingAssignmentId(null)}
        onConfirm={confirmRemoveAssignment}
        title="Remove Assignment?"
        description="Are you sure you want to remove this person from this occurrence? This will not affect other occurrences."
        confirmLabel="Remove"
        cancelLabel="Cancel"
      />
    </div>
  )
}
