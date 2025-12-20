'use client'

import { useState } from 'react'
import { ContentCard, Card, CardHeader, CardTitle, CardContent } from '@/components/content-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PersonPickerField } from '@/components/person-picker-field'
import { ConfirmationDialog } from '@/components/confirmation-dialog'
import { User, X, Plus } from 'lucide-react'
import type { MasterEventWithRelations, Person, RoleDefinition } from '@/lib/types'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface RoleAssignmentSectionProps {
  masterEvent: MasterEventWithRelations
  onRoleAssigned?: (roleId: string, person: Person, notes?: string) => Promise<void>
  onRoleRemoved?: (roleAssignmentId: string) => Promise<void>
}

interface RoleAssignmentState {
  roleId: string
  person: Person | null
  notes: string
  showPicker: boolean
}

/**
 * RoleAssignmentSection - Displays and manages role assignments for master events
 *
 * Features:
 * - Shows all roles from event_type.role_definitions
 * - Displays assigned person or "Unassigned" state
 * - Person picker for assignment
 * - Remove button with confirmation
 * - Required badge for required roles
 * - Notes field for each role
 *
 * Per FORMS.md and STYLES.md: Uses semantic color tokens and supports dark mode.
 */
export function RoleAssignmentSection({
  masterEvent,
  onRoleAssigned,
  onRoleRemoved,
}: RoleAssignmentSectionProps) {
  const [editingRole, setEditingRole] = useState<RoleAssignmentState | null>(null)
  const [removingRoleId, setRemovingRoleId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get role definitions from event type
  const roleDefinitions: RoleDefinition[] = masterEvent.event_type?.role_definitions?.roles || []

  // Get existing role assignments
  const roleAssignments = masterEvent.roles || []

  // Find assignment for a role
  const findAssignment = (roleId: string) => {
    return roleAssignments.find(assignment => assignment.role_id === roleId)
  }

  // Handle opening person picker for a role
  const handleAssignRole = (role: RoleDefinition) => {
    const existingAssignment = findAssignment(role.id)
    setEditingRole({
      roleId: role.id,
      person: existingAssignment ? (existingAssignment as any).person || null : null,
      notes: existingAssignment?.notes || '',
      showPicker: true,
    })
  }

  // Handle person selection
  const handlePersonSelected = (person: Person | null) => {
    if (editingRole) {
      setEditingRole({
        ...editingRole,
        person,
      })
    }
  }

  // Handle notes change
  const handleNotesChange = (notes: string) => {
    if (editingRole) {
      setEditingRole({
        ...editingRole,
        notes,
      })
    }
  }

  // Save role assignment
  const handleSaveAssignment = async () => {
    if (!editingRole || !editingRole.person || !onRoleAssigned) return

    setIsSubmitting(true)
    try {
      await onRoleAssigned(editingRole.roleId, editingRole.person, editingRole.notes)
      setEditingRole(null)
    } catch (error) {
      console.error('Failed to assign role:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingRole(null)
  }

  // Handle remove role
  const handleRemoveRole = (roleAssignmentId: string) => {
    setRemovingRoleId(roleAssignmentId)
  }

  // Confirm remove role
  const confirmRemoveRole = async () => {
    if (!removingRoleId || !onRoleRemoved) return

    setIsSubmitting(true)
    try {
      await onRoleRemoved(removingRoleId)
      setRemovingRoleId(null)
    } catch (error) {
      console.error('Failed to remove role:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (roleDefinitions.length === 0) {
    return (
      <ContentCard>
        <p className="text-muted-foreground text-center">
          No roles defined for this event type.
        </p>
      </ContentCard>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Role Assignments</h3>

      <div className="space-y-3">
        {roleDefinitions.map((role) => {
          const assignment = findAssignment(role.id)
          const assignedPerson = assignment ? (assignment as any).person : null

          const titleContent = (
            <div className="flex items-center gap-2">
              <span>{role.name}</span>
              {role.required && (
                <Badge variant="destructive" className="text-xs">
                  Required
                </Badge>
              )}
            </div>
          )

          const actionButtons = (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAssignRole(role)}
                disabled={isSubmitting}
              >
                {assignedPerson ? (
                  <>
                    <User className="h-4 w-4 mr-1" />
                    Change
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-1" />
                    Assign
                  </>
                )}
              </Button>

              {assignment && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveRole(assignment.id)}
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </>
          )

          return (
            <ContentCard key={role.id} title={titleContent} actions={actionButtons}>
              {assignedPerson ? (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  <span>{assignedPerson.full_name}</span>
                </div>
              ) : (
                <p className="text-muted-foreground">Unassigned</p>
              )}

              {assignment?.notes && (
                <p className="text-muted-foreground mt-2">
                  {assignment.notes}
                </p>
              )}
            </ContentCard>
          )
        })}
      </div>

      {/* Person Picker Dialog */}
      {editingRole && (
        <Card className="bg-card text-card-foreground border fixed bottom-4 right-4 w-96 shadow-lg z-50">
          <CardHeader>
            <CardTitle className="text-base">
              Assign Role: {roleDefinitions.find(r => r.id === editingRole.roleId)?.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <PersonPickerField
              label="Person"
              value={editingRole.person}
              onValueChange={handlePersonSelected}
              showPicker={editingRole.showPicker}
              onShowPickerChange={(show) => setEditingRole({ ...editingRole, showPicker: show })}
              placeholder="Select person for this role"
              required={true}
              openToNewPerson={!editingRole.person}
            />

            <div className="space-y-2">
              <Label htmlFor="role-notes">Notes</Label>
              <Textarea
                id="role-notes"
                value={editingRole.notes}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder="Add notes about this role assignment..."
                rows={3}
                className="text-sm"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelEdit}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSaveAssignment}
                disabled={!editingRole.person || isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Remove Confirmation Dialog */}
      <ConfirmationDialog
        open={!!removingRoleId}
        onOpenChange={(open) => !open && setRemovingRoleId(null)}
        onConfirm={confirmRemoveRole}
        title="Remove Role Assignment?"
        description="Are you sure you want to remove this person from this role? This action cannot be undone."
        confirmLabel="Remove"
        cancelLabel="Cancel"
      />
    </div>
  )
}
